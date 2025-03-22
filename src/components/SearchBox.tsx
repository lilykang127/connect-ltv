
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SearchBoxProps {
  onSearch?: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSearch) {
        await onSearch(query);
      } else {
        navigate(`/results?q=${encodeURIComponent(query)}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-2 text-sm font-medium text-gray-700">
        What guidance or expertise are you looking for?
      </div>
      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I'm looking for someone with expertise in go-to-market for early-stage enterprise software within the education sector in the United States"
          className="w-full h-32 p-4 pr-14 text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-connect-blue focus:border-transparent outline-none transition-all resize-none"
          disabled={isSubmitting}
        />
        <button 
          type="submit"
          className="absolute right-3 bottom-3 gradient-button rounded-lg p-3 text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2 disabled:opacity-70"
          aria-label="Search"
          disabled={isSubmitting}
        >
          <span>
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </span>
        </button>
      </form>
    </div>
  );
};

export default SearchBox;
