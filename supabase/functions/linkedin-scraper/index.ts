
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
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
          const page = await browser.newPage();
          
          // Set a user agent to avoid detection
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');
          
          // Go to LinkedIn profile
          await page.goto(linkedInUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Extract profile information
          const profileData = await page.evaluate(() => {
            // Get the about section
            const aboutElement = document.querySelector('.pv-about-section .pv-shared-text-with-see-more');
            const about = aboutElement ? aboutElement.textContent.trim() : '';
            
            // Get experience information
            const experienceElements = document.querySelectorAll('.experience-section .pv-entity__summary-info');
            let experience = '';
            experienceElements.forEach(element => {
              experience += element.textContent.trim() + '\n\n';
            });
            
            // Get education information
            const educationElements = document.querySelectorAll('.education-section .pv-entity__summary-info');
            let education = '';
            educationElements.forEach(element => {
              education += element.textContent.trim() + '\n\n';
            });
            
            return { about, experience, education };
          });
          
          // Format the data
          const scrapedContent = `
About:
${profileData.about || 'No information available'}

Experience:
${profileData.experience || 'No information available'}

Education:
${profileData.education || 'No information available'}
          `.trim();
          
          // Update database
          const { error: updateError } = await supabase
            .from('LTV Alumni Database')
            .update({ 'LinkedIn Scrape': scrapedContent })
            .eq('Index', alumni.Index);
          
          if (updateError) {
            console.error(`Error updating profile ${alumni.Index}:`, updateError);
          } else {
            console.log(`Successfully scraped and updated profile ${alumni.Index}`);
          }
          
          // Close the page to free up memory
          await page.close();
          
        } catch (profileError) {
          console.error(`Error processing profile ${alumni.Index}:`, profileError);
          
          // If there's an error scraping, we'll mark it with an error message
          const errorMessage = `Error scraping profile: ${profileError.message || 'Unknown error'}`;
          
          const { error: updateError } = await supabase
            .from('LTV Alumni Database')
            .update({ 'LinkedIn Scrape': errorMessage })
            .eq('Index', alumni.Index);
            
          if (updateError) {
            console.error(`Error updating profile ${alumni.Index} with error message:`, updateError);
          }
        }
        
        completed++;
        
        // Add a delay between profiles to avoid rate limiting
        await new Promise(r => setTimeout(r, 2000));
      }
    } finally {
      // Make sure to close the browser
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
