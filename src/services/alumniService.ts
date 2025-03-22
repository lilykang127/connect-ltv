
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
    
    // Process search terms - filter out terms that are too short
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    console.log('Search terms:', searchTerms);
    
    // Construct the search filter
    const searchFilter = searchTerms.map(term => 
      `Title.ilike.%${term}%, Company.ilike.%${term}%, Location.ilike.%${term}%, function.ilike.%${term}%, stage.ilike.%${term}%, comments.ilike.%${term}%`
    ).join(',');
    
    console.log('Using filter:', searchFilter);
    console.log('Querying table:', 'LTV Alumni Database');
    
    // Query the database table
    const { data, error } = await supabase
      .from('LTV Alumni Database')
      .select('*')
      .or(searchFilter)
      .limit(limit);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Search results:', data ? data.length : 0);
    console.log('First result:', data && data.length > 0 ? data[0] : 'No results');
    
    // Transform data to match AlumniData interface
    return data.map(alumni => ({
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
    return [];
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
