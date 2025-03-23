
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import AlumniCard, { AlumniData } from '@/components/AlumniCard';
import ResultsLoader from '@/components/ResultsLoader';
import { searchAlumni } from '@/services/alumniService';
import { useToast } from "@/components/ui/use-toast";

const Results: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<AlumniData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setIsLoading(false);
        setError("No search query provided");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching alumni results for query:", query);
        const alumniResults = await searchAlumni({ query });
        console.log("Results received:", alumniResults.length);
        setResults(alumniResults);
        
        // Set a summary of the search for debugging purposes
        setSearchSummary(`Search for "${query}" returned ${alumniResults.length} results.`);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError("Failed to search alumni. Please try again.");
        toast({
          title: "Search Error",
          description: "There was a problem searching for alumni. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, toast]);

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Results for your query</h2>
            <p className="text-gray-600 italic">"{query}"</p>
            {searchSummary && <p className="text-sm text-gray-500 mt-1">{searchSummary}</p>}
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
                New Search
              </button>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((alumni, index) => (
                <AlumniCard 
                  key={alumni.id} 
                  alumni={alumni} 
                  rank={index} 
                  searchQuery={query}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-4">No matching alumni found</h3>
              <p className="text-gray-600 mb-6">
                Try searching for a different term. For example, try company names, job titles, or first/last names.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-gray-700 mb-2">Search Tips:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Try searching for "McKinsey" to find consultants</li>
                  <li>Search by job title like "CEO" or "Director"</li>
                  <li>Try searching for company names like "Google" or "Apple"</li>
                  <li>First names or last names work too</li>
                </ul>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="gradient-button py-2 px-4 rounded-lg text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2"
              >
                New Search
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
