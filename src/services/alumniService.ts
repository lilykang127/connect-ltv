
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
    
    // Create a more effective query builder
    let queryBuilder = supabase
      .from('LTV Alumni Database')
      .select('*');
    
    // For single term searches, try exact title match first (case insensitive)
    if (terms.length === 1) {
      console.log('Searching for exact title match:', terms[0]);
      const exactTerm = terms[0];
      
      // Try direct match on Title first (common search case)
      const { data: exactMatches, error: exactError } = await supabase
        .from('LTV Alumni Database')
        .select('*')
        .ilike('Title', exactTerm)
        .limit(limit);
      
      if (exactError) {
        console.error('Error searching for exact match:', exactError);
      } else if (exactMatches && exactMatches.length > 0) {
        console.log('Found exact title matches:', exactMatches.length);
        
        // Transform and return exact matches
        return exactMatches.map(alumni => ({
          id: alumni.Index || 0,
          name: `${alumni['First Name'] || ''} ${alumni['Last Name'] || ''}`.trim(),
          position: alumni['Title'] || '',
          company: alumni['Company'] || '',
          relevance: generateRelevanceText(alumni, query),
          email: alumni['Email Address'] || '',
          linkedIn: alumni['LinkedIn URL'] || ''
        }));
      } else {
        console.log('No exact title matches found, trying broader search');
      }
    }
    
    // If multiple terms or no exact matches found, perform broader search
    console.log('Performing broader search across all fields');
    
    // First attempt contains search (field contains term)
    // Use individual contains searches for better database performance
    for (const term of terms) {
      queryBuilder = queryBuilder.or(`"First Name".ilike.%${term}%,"Last Name".ilike.%${term}%,Title.ilike.%${term}%,Company.ilike.%${term}%,Location.ilike.%${term}%,function.ilike.%${term}%,stage.ilike.%${term}%,comments.ilike.%${term}%`);
    }
    
    // Apply limit and execute
    queryBuilder = queryBuilder.limit(limit);
    console.log('Executing search query');
    const { data, error } = await queryBuilder;
    
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
