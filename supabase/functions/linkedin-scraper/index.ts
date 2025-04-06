
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const requestData = await req.json();
    const { limit = 5 } = requestData; // Default to processing 5 profiles at a time
    
    // Query the database for LinkedIn URLs that haven't been scraped yet
    const { data: alumniData, error: queryError } = await supabase
      .from('LTV Alumni Database')
      .select('Index, "LinkedIn URL", "LinkedIn Scrape"')
      .is('LinkedIn Scrape', null)
      .not('LinkedIn URL', 'is', null)
      .limit(limit);
    
    if (queryError) throw queryError;
    
    if (!alumniData || alumniData.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No profiles left to scrape', completed: 0, total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const total = alumniData.length;
    let completed = 0;
    
    // Launch browser
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      for (const alumni of alumniData) {
        const linkedInUrl = alumni['LinkedIn URL'];
        
        if (!linkedInUrl) {
          completed++;
          continue;
        }
        
        console.log(`Processing URL: ${linkedInUrl}`);
        
        try {
          // Open a new page
          const page = await browser.newPage();
          
          // Set a random user agent to avoid detection
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
          
          // Navigate to LinkedIn profile
          await page.goto(linkedInUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Add a delay to avoid detection (random between 2-5 seconds)
          await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
          
          // Extract profile data
          const profileData = await page.evaluate(() => {
            // Function to safely get text content
            const getText = (selector) => {
              const element = document.querySelector(selector);
              return element ? element.textContent.trim() : '';
            };
            
            // Get about section
            const about = getText('.display-flex.ph5.pv3 .display-flex.mt2 span[aria-hidden="true"]') || 
                          getText('.pv-shared-text-with-see-more span[aria-hidden="true"]');
            
            // Get experience
            const experienceItems = Array.from(document.querySelectorAll('#experience ~ .pvs-list__outer-container > ul > li'));
            const experience = experienceItems.map(item => {
              const title = item.querySelector('.display-flex.align-items-center span[aria-hidden="true"]')?.textContent.trim() || '';
              const company = item.querySelector('.t-14.t-normal:not(.t-black--light) span[aria-hidden="true"]')?.textContent.trim() || '';
              const dates = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]')?.textContent.trim() || '';
              return `${title} at ${company} (${dates})`;
            }).join('\n');
            
            // Get education
            const educationItems = Array.from(document.querySelectorAll('#education ~ .pvs-list__outer-container > ul > li'));
            const education = educationItems.map(item => {
              const school = item.querySelector('.display-flex.align-items-center span[aria-hidden="true"]')?.textContent.trim() || '';
              const degree = item.querySelector('.t-14.t-normal:not(.t-black--light) span[aria-hidden="true"]')?.textContent.trim() || '';
              const dates = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]')?.textContent.trim() || '';
              return `${school} - ${degree} (${dates})`;
            }).join('\n');
            
            return {
              about,
              experience,
              education
            };
          });
          
          // Close the page
          await page.close();
          
          // Format the scraped data
          const scrapedContent = `
About:
${profileData.about || 'Not available'}

Experience:
${profileData.experience || 'Not available'}

Education:
${profileData.education || 'Not available'}
          `.trim();
          
          // Update the database with scraped content
          const { error: updateError } = await supabase
            .from('LTV Alumni Database')
            .update({ 'LinkedIn Scrape': scrapedContent })
            .eq('Index', alumni.Index);
          
          if (updateError) {
            console.error(`Error updating profile ${alumni.Index}:`, updateError);
          } else {
            console.log(`Successfully updated profile ${alumni.Index}`);
          }
          
        } catch (profileError) {
          console.error(`Error processing profile ${alumni.Index}:`, profileError);
        }
        
        completed++;
        
        // Add a random delay between profiles (3-8 seconds)
        await new Promise(r => setTimeout(r, 3000 + Math.random() * 5000));
      }
    } finally {
      // Close the browser
      await browser.close();
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Scraping completed', 
        completed, 
        total 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in LinkedIn scraper:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during scraping',
        completed: 0,
        total: 0
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
