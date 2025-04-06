
import { supabase } from '@/integrations/supabase/client';
import { AlumniData } from '@/components/AlumniCard';

// Interface for search query parameters
interface SearchParams {
  query: string;
  limit?: number;
}

/**
 * Search for alumni using fuzzy search across all fields
 */
export const searchAlumni = async ({ query, limit = 50 }: SearchParams): Promise<AlumniData[]> => {
  try {
    console.log('Search request received with query:', query);
    
    if (!query.trim()) {
      console.log('Empty query, fetching all alumni profiles');
      // Simply fetch all records from the database with a limit
      const { data, error } = await supabase
        .from('LTV Alumni Database')
        .select('*')
        .limit(limit);
      
      if (error) {
        console.error('Error fetching alumni:', error);
        throw error;
      }
      
      return transformAlumniData(data || [], '');
    }
    
    console.log('Performing fuzzy search with query:', query);
    
    // Create search conditions for each relevant field
    const searchTerms = query.trim().toLowerCase().split(/\s+/);
    
    // Start with the base query
    let supabaseQuery = supabase
      .from('LTV Alumni Database')
      .select('*');
    
    // Add search conditions
    for (const term of searchTerms) {
      supabaseQuery = supabaseQuery.or(
        `"First Name".ilike.%${term}%,` + 
        `"Last Name".ilike.%${term}%,` +
        `"Title".ilike.%${term}%,` +
        `"Company".ilike.%${term}%,` +
        `"Location".ilike.%${term}%,` +
        `"function".ilike.%${term}%,` +
        `"stage".ilike.%${term}%,` +
        `"comments".ilike.%${term}%`
      );
    }
    
    // Execute the query with limit
    const { data, error } = await supabaseQuery.limit(limit);
    
    if (error) {
      console.error('Error during fuzzy search:', error);
      throw error;
    }
    
    console.log('Search results count:', data?.length || 0);
    
    // Score and sort results by relevance
    const scoredResults = scoreAndSortResults(data || [], query);
    
    return transformAlumniData(scoredResults, query);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
};

/**
 * Score and sort results by relevance to the search query
 */
const scoreAndSortResults = (results: any[], query: string): any[] => {
  const terms = query.toLowerCase().split(/\s+/);
  
  // Score each result based on matches
  const scoredResults = results.map(alumni => {
    let score = 0;
    const fullName = `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.toLowerCase();
    const title = (alumni['Title'] || '').toLowerCase();
    const company = (alumni['Company'] || '').toLowerCase();
    const location = (alumni['Location'] || '').toLowerCase();
    const functionField = (alumni['function'] || '').toLowerCase();
    const stage = (alumni['stage'] || '').toLowerCase();
    const comments = (alumni['comments'] || '').toLowerCase();
    
    // Check each term against each field
    for (const term of terms) {
      // Give higher weights to name matches
      if (fullName.includes(term)) score += 10;
      if (title.includes(term)) score += 7;
      if (company.includes(term)) score += 7;
      if (location.includes(term)) score += 3;
      if (functionField.includes(term)) score += 5;
      if (stage.includes(term)) score += 5;
      if (comments.includes(term)) score += 5;
    }
    
    return { ...alumni, score };
  });
  
  // Sort by score (highest first)
  return scoredResults.sort((a, b) => b.score - a.score);
};

/**
 * Transform database results to match the AlumniData interface
 */
const transformAlumniData = (data: any[], query: string): AlumniData[] => {
  return data.map(alumni => ({
    id: alumni.Index || 0,
    name: `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.trim(),
    position: alumni['Title'] || '',
    company: alumni['Company'] || '',
    relevance: generateRelevanceText(alumni, query),
    email: alumni['Email Address'] || '',
    linkedIn: alumni['LinkedIn URL'] || ''
  }));
};

/**
 * Generate a relevance description for each alumni based on the search query
 */
const generateRelevanceText = (alumni: any, query: string): string => {
  const relevancePoints = [];
  
  // Basic information about position and company
  if (alumni['Title'] && alumni['Company']) {
    relevancePoints.push(`Works as ${alumni['Title']} at ${alumni['Company']}.`);
  }
  
  // Add function information if available
  if (alumni['function']) {
    relevancePoints.push(`Expertise in ${alumni['function']}.`);
  }
  
  // Add stage information if available
  if (alumni['stage']) {
    relevancePoints.push(`Experience with ${alumni['stage']} stage companies.`);
  }
  
  // Include any comments
  if (alumni['comments']) {
    relevancePoints.push(alumni['comments']);
  }
  
  // Generate the final relevance text
  return relevancePoints.join(' ');
};

/**
 * Get alumni by ID
 */
export const getAlumniById = async (id: number): Promise<AlumniData | null> => {
  try {
    console.log('Fetching alumni with ID:', id);
    
    const { data, error } = await supabase
      .from('LTV Alumni Database')
      .select('*')
      .eq('Index', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching alumni by ID:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No alumni found with ID:', id);
      return null;
    }
    
    return {
      id: data.Index || 0,
      name: `${data['First Name'] || ''} ${data['Last Name'] || ''}`.trim(),
      position: data['Title'] || '',
      company: data['Company'] || '',
      relevance: data['comments'] || '',
      email: data['Email Address'] || '',
      linkedIn: data['LinkedIn URL'] || ''
    };
  } catch (error) {
    console.error('Error fetching alumni by ID:', error);
    return null;
  }
};

/**
 * Get LinkedIn scrape data for an alumni by ID
 */
export const getLinkedInScrapeData = async (id: number): Promise<string | null> => {
  try {
    console.log('Fetching LinkedIn scrape data for alumni with ID:', id);
    
    const { data, error } = await supabase
      .from('LTV Alumni Database')
      .select('LinkedIn Scrape')
      .eq('Index', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching LinkedIn scrape data:', error);
      throw error;
    }
    
    if (!data || !data['LinkedIn Scrape']) {
      console.log('No LinkedIn scrape data found for alumni with ID:', id);
      return null;
    }
    
    return data['LinkedIn Scrape'];
  } catch (error) {
    console.error('Error fetching LinkedIn scrape data:', error);
    return null;
  }
};

/**
 * Get statistics about LinkedIn scraping progress
 */
export const getScrapingStats = async (): Promise<{ total: number; scraped: number; pending: number }> => {
  try {
    // Get total count
    const { count: total } = await supabase
      .from('LTV Alumni Database')
      .select('*', { count: 'exact', head: true });
    
    // Get count of scraped profiles
    const { count: scraped } = await supabase
      .from('LTV Alumni Database')
      .select('*', { count: 'exact', head: true })
      .not('LinkedIn Scrape', 'is', null);
    
    // Get count of not scraped profiles with LinkedIn URLs
    const { count: pending } = await supabase
      .from('LTV Alumni Database')
      .select('*', { count: 'exact', head: true })
      .is('LinkedIn Scrape', null)
      .not('LinkedIn URL', 'is', null);
    
    return {
      total: total || 0,
      scraped: scraped || 0,
      pending: pending || 0
    };
  } catch (error) {
    console.error('Error fetching scraping stats:', error);
    return { total: 0, scraped: 0, pending: 0 };
  }
};
