
import { supabase } from '@/lib/supabase';
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
    // For full-text search - you'll need to set up full-text search in Supabase
    // Using "ilike" for simple pattern matching for now, but should be replaced with more robust search
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .or(`position.ilike.%${query}%,company.ilike.%${query}%,bio.ilike.%${query}%,skills.ilike.%${query}%`)
      .order('relevance_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Transform data to match AlumniData interface
    return data.map(alumni => ({
      id: alumni.id,
      name: alumni.name,
      position: alumni.position,
      company: alumni.company,
      relevance: calculateRelevance(alumni, query),
      email: alumni.email,
      linkedIn: alumni.linkedin_url
    }));
  } catch (error) {
    console.error('Error searching alumni:', error);
    // Return empty array or throw error based on your error handling strategy
    return [];
  }
};

/**
 * Calculate relevance description based on search query
 * This function will need to be expanded with more sophisticated relevance logic
 */
const calculateRelevance = (alumni: any, query: string): string => {
  // This is a simplified example - you'd want more sophisticated relevance calculation
  // Ideally, this would be done by your backend using embeddings or NLP
  const lowerQuery = query.toLowerCase();
  const matchTerms = ['expertise', 'experience', 'background', 'skills', 'knowledge'];
  
  const relevanceDescriptions = [
    `${alumni.name} has extensive ${matchTerms.find(term => lowerQuery.includes(term)) || 'expertise'} in ${alumni.position} at ${alumni.company}.`,
    `Their background in ${alumni.skills || alumni.industry || 'the field'} makes them an excellent resource for your query.`,
    `Based on their work at ${alumni.company}, they can provide valuable insights on your specific needs.`
  ];
  
  return relevanceDescriptions.join(' ');
};

/**
 * Get alumni by ID
 */
export const getAlumniById = async (id: number): Promise<AlumniData | null> => {
  try {
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      position: data.position,
      company: data.company,
      relevance: data.bio || '',
      email: data.email,
      linkedIn: data.linkedin_url
    };
  } catch (error) {
    console.error('Error fetching alumni by ID:', error);
    return null;
  }
};
