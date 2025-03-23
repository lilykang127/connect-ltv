
import { supabase } from '@/integrations/supabase/client';
import { AlumniData } from '@/components/AlumniCard';

// Interface for search query parameters
interface SearchParams {
  query: string;
  limit?: number;
}

/**
 * Search for alumni based on query across all fields
 */
export const searchAlumni = async ({ query, limit = 10 }: SearchParams): Promise<AlumniData[]> => {
  try {
    console.log('Searching for:', query);
    
    if (!query.trim()) {
      console.log('Empty query, returning empty results');
      return [];
    }

    // Create search terms by splitting the query
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    if (terms.length === 0) {
      return [];
    }

    console.log('Search terms:', terms);
    
    // Build filter conditions for each term across all relevant fields
    let filterConditions = [];
    
    for (const term of terms) {
      // Add a condition for each field we want to search
      filterConditions.push(`
        "First Name".ilike.%${term}% or
        "Last Name".ilike.%${term}% or
        Title.ilike.%${term}% or
        Company.ilike.%${term}% or
        Location.ilike.%${term}% or
        function.ilike.%${term}% or
        stage.ilike.%${term}% or
        comments.ilike.%${term}%
      `);
    }
    
    // Join all term conditions with AND (each term must match at least one field)
    const filterString = filterConditions.join(' and ');
    
    console.log('Using filter:', filterString);
    
    // Execute the search query
    const { data, error } = await supabase
      .from('LTV Alumni Database')
      .select('*')
      .or(filterString)
      .limit(limit);
    
    if (error) {
      console.error('Error searching alumni:', error);
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
    console.error('Error searching alumni:', error);
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
