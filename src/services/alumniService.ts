import { supabase } from '@/integrations/supabase/client';
import { AlumniData } from '@/components/AlumniCard';

// Interface for search query parameters
interface SearchParams {
  query: string;
  limit?: number;
}

/**
 * Search for alumni based on natural language query
 */
export const searchAlumni = async ({ query, limit = 10 }: SearchParams): Promise<AlumniData[]> => {
  try {
    console.log('Searching for:', query);
    
    if (!query.trim()) {
      console.log('Empty query, returning empty results');
      return [];
    }

    // First try an exact search on specific fields
    const exactQuery = query.trim();
    console.log('Trying exact match first with:', exactQuery);
    
    // Try exact match on critical fields first
    const { data: exactMatches, error: exactMatchError } = await supabase
      .from('LTV Alumni Database')
      .select('*')
      .or(`"First Name".ilike.${exactQuery},"Last Name".ilike.${exactQuery},Company.ilike.${exactQuery},Title.ilike.${exactQuery}`)
      .limit(limit);
    
    if (exactMatchError) {
      console.error('Error with exact match:', exactMatchError);
    } else if (exactMatches && exactMatches.length > 0) {
      console.log('Found exact matches:', exactMatches.length);
      
      // Transform exact matches to match AlumniData interface
      return exactMatches.map(alumni => ({
        id: alumni.Index || 0,
        name: `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.trim(),
        position: alumni['Title'] || '',
        company: alumni['Company'] || '',
        relevance: calculateRelevance(alumni, query),
        email: alumni['Email Address'] || '',
        linkedIn: alumni['LinkedIn URL'] || ''
      }));
    }
    
    // If no exact matches, perform fuzzy search
    console.log('No exact matches, performing fuzzy search');
    
    // Create search terms from the query for fuzzy search
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    console.log('Fuzzy search terms:', searchTerms);
    
    if (searchTerms.length === 0) {
      console.log('No search terms found for fuzzy search, returning empty results');
      return [];
    }
    
    // Build the filter string for fuzzy search across all relevant fields
    let filterString = '';
    
    searchTerms.forEach((term, index) => {
      if (index > 0) filterString += ',';
      
      // Search across all relevant fields with ilike for fuzzy matching
      // Using %term% for substring matching
      filterString += `"First Name".ilike.%${term}%`;
      filterString += `,"Last Name".ilike.%${term}%`;
      filterString += `,Title.ilike.%${term}%`;
      filterString += `,Company.ilike.%${term}%`;
      filterString += `,Location.ilike.%${term}%`;
      filterString += `,function.ilike.%${term}%`;
      filterString += `,stage.ilike.%${term}%`;
      filterString += `,comments.ilike.%${term}%`;
    });
    
    console.log('Using fuzzy filter string:', filterString);
    
    // Execute the fuzzy search query against the database
    const { data: fuzzyResults, error: fuzzyError } = await supabase
      .from('LTV Alumni Database')
      .select('*')
      .or(filterString)
      .limit(limit);
    
    if (fuzzyError) {
      console.error('Supabase error during fuzzy search:', fuzzyError);
      throw fuzzyError;
    }
    
    console.log('Fuzzy search results count:', fuzzyResults?.length || 0);
    if (fuzzyResults && fuzzyResults.length > 0) {
      console.log('Sample fuzzy result:', JSON.stringify(fuzzyResults[0]));
    } else {
      console.log('No fuzzy results found');
    }
    
    // Transform database results to match the AlumniData interface
    return (fuzzyResults || []).map(alumni => ({
      id: alumni.Index || 0,
      name: `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.trim(),
      position: alumni['Title'] || '',
      company: alumni['Company'] || '',
      relevance: calculateRelevance(alumni, query),
      email: alumni['Email Address'] || '',
      linkedIn: alumni['LinkedIn URL'] || ''
    }));
  } catch (error) {
    console.error('Error searching alumni:', error);
    throw error;
  }
};

/**
 * Calculate relevance description based on search query
 */
const calculateRelevance = (alumni: any, query: string): string => {
  const name = `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.trim();
  const position = alumni['Title'] || 'their position';
  const company = alumni['Company'] || 'their company';
  const function_area = alumni['function'] || '';
  const stage = alumni['stage'] || '';
  const comments = alumni['comments'] || '';
  
  // Create a more personalized relevance string based on available data
  const relevancePoints = [];
  
  if (position && company) {
    relevancePoints.push(`${name} has experience as ${position} at ${company}.`);
  }
  
  if (function_area) {
    relevancePoints.push(`Their expertise in ${function_area} aligns with your interests.`);
  }
  
  if (stage) {
    relevancePoints.push(`They have experience with ${stage} stage companies.`);
  }
  
  if (comments) {
    relevancePoints.push(`${comments}`);
  }
  
  // Add a general point about how they can help with the specific query
  relevancePoints.push(`Based on your search for "${query}", they can provide valuable insights and guidance.`);
  
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
      .single();
    
    if (error) {
      console.error('Error fetching alumni by ID:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No alumni found with ID:', id);
      return null;
    }
    
    console.log('Found alumni:', data);
    
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
