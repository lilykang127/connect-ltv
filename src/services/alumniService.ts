import { supabase } from '@/integrations/supabase/client';
import { AlumniData } from '@/components/AlumniCard';

// Interface for search query parameters
interface SearchParams {
  query: string;
  limit?: number;
}

/**
 * Search for alumni - now always returns all profiles regardless of query
 */
export const searchAlumni = async ({ query, limit = 50 }: SearchParams): Promise<AlumniData[]> => {
  try {
    console.log('Search request received with query:', query);
    console.log('Fetching all alumni profiles regardless of query');
    
    // Simply fetch all records from the database with a limit
    const { data, error } = await supabase
      .from('LTV Alumni Database')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching alumni:', error);
      throw error;
    }
    
    console.log('Results count:', data?.length || 0);
    
    // Transform database results to match the AlumniData interface
    return (data || []).map(alumni => ({
      id: alumni.Index || 0,
      name: `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.trim(),
      position: alumni['Title'] || '',
      company: alumni['Company'] || '',
      relevance: generateRelevanceText(alumni, query),
      email: alumni['Email Address'] || '',
      linkedIn: alumni['LinkedIn URL'] || ''
    }));
  } catch (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
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
