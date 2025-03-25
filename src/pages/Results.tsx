
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import AlumniCard, { AlumniData } from '@/components/AlumniCard';
import ResultsLoader from '@/components/ResultsLoader';
import { searchAlumni } from '@/services/alumniService';
import { useToast } from "@/hooks/use-toast";

// Number of alumni to show per category
const ALUMNI_PER_CATEGORY = 5;

const Results: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allResults, setAllResults] = useState<AlumniData[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    topMatches: AlumniData[];
    notableMatches: AlumniData[];
    others: AlumniData[];
  }>({
    topMatches: [],
    notableMatches: [],
    others: []
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Performing search with query:", query);
        const alumniResults = await searchAlumni({ query });
        console.log("Results received:", alumniResults.length);
        
        setAllResults(alumniResults);
        
        // Take top 15 results and categorize them
        const limitedResults = alumniResults.slice(0, ALUMNI_PER_CATEGORY * 3);
        
        setCategorizedResults({
          topMatches: limitedResults.slice(0, ALUMNI_PER_CATEGORY),
          notableMatches: limitedResults.slice(ALUMNI_PER_CATEGORY, ALUMNI_PER_CATEGORY * 2),
          others: limitedResults.slice(ALUMNI_PER_CATEGORY * 2, ALUMNI_PER_CATEGORY * 3)
        });
      } catch (error) {
        console.error('Error fetching results:', error);
        setError("Failed to fetch alumni. Please try again.");
        toast({
          title: "Search Error",
          description: "There was a problem retrieving alumni profiles. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, toast]);

  const renderCategorySection = (title: string, alumni: AlumniData[], description: string) => (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="space-y-6">
        {alumni.map((alum) => (
          <AlumniCard 
            key={alum.id} 
            alumni={alum} 
            searchQuery={query}
            onClick={() => navigate(`/alumni/${alum.id}`)}
            category={title}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-connect-blue transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>New Search</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h2>
            <p className="text-gray-600">
              {allResults.length > 0 ? 
                `Showing top ${Math.min(allResults.length, ALUMNI_PER_CATEGORY * 3)} alumni matches for "${query}"` : 
                query ? 'Searching...' : 'Loading all profiles...'
              }
            </p>
          </div>

          {isLoading ? (
            <ResultsLoader />
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-4">Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => navigate('/')}
                className="gradient-button py-2 px-4 rounded-lg text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          ) : allResults.length > 0 ? (
            <div className="space-y-12">
              {renderCategorySection(
                "Top Matches",
                categorizedResults.topMatches,
                "Alumni who most closely match your search criteria."
              )}
              
              {renderCategorySection(
                "Notable Matches",
                categorizedResults.notableMatches,
                "Alumni with significant relevant experience to your search."
              )}
              
              {renderCategorySection(
                "Others You Might Be Interested In",
                categorizedResults.others,
                "Additional alumni with perspectives that could be valuable."
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-4">No profiles found</h3>
              <p className="text-gray-600 mb-6">
                Please try again with different search terms.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="gradient-button py-2 px-4 rounded-lg text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ConnectLTV. Harvard Business School. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Results;
