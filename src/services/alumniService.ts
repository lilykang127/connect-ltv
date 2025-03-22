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
    
    // Instead of filtering short terms, let's keep all meaningful terms
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    console.log('Search terms:', searchTerms);
    
    if (searchTerms.length === 0) {
      console.log('No search terms found, returning empty results');
      return [];
    }
    
    // Check if we can directly query for a name (first + last)
    const possibleFullName = query.trim();
    let results = [];
    
    // First try to do an exact match on the full name
    if (possibleFullName.includes(' ')) {
      console.log('Trying exact name match first...');
      
      const nameParts = possibleFullName.split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        const { data: exactMatches, error: exactMatchError } = await supabase
          .from('LTV Alumni Database')
          .select('*')
          .ilike('First Name', `%${firstName}%`)
          .ilike('Last Name', `%${lastName}%`);
        
        if (exactMatchError) {
          console.error('Error with exact name match:', exactMatchError);
        } else if (exactMatches && exactMatches.length > 0) {
          console.log('Found exact name matches:', exactMatches.length);
          results = exactMatches;
        }
      }
    }
    
    // If no results from exact name match, do a broader search
    if (results.length === 0) {
      console.log('Performing broader search...');
      
      // Build a search filter for each term
      let filterString = '';
      
      searchTerms.forEach((term, index) => {
        if (index > 0) filterString += ',';
        filterString += `Title.ilike.%${term}%`;
        filterString += `,Company.ilike.%${term}%`;
        filterString += `,Location.ilike.%${term}%`;
        filterString += `,function.ilike.%${term}%`;
        filterString += `,stage.ilike.%${term}%`;
        filterString += `,comments.ilike.%${term}%`;
        filterString += `,"First Name".ilike.%${term}%`;
        filterString += `,"Last Name".ilike.%${term}%`;
      });
      
      console.log('Using filter string:', filterString);
      
      // Perform the search
      const { data, error } = await supabase
        .from('LTV Alumni Database')
        .select('*')
        .or(filterString)
        .limit(limit);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      results = data || [];
    }
    
    console.log('Search results count:', results.length);
    if (results.length > 0) {
      console.log('Sample result:', JSON.stringify(results[0]));
    } else {
      console.log('No results found');
    }
    
    // Transform data to match AlumniData interface
    return results.map(alumni => ({
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
    throw error; // Let's throw the error so we can handle it in the UI
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
