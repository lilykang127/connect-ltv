
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

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
    
    console.log('Submitting search query:', query);
    setIsSubmitting(true);
    
    try {
      if (onSearch) {
        await onSearch(query);
      } else {
        // Use navigate to send to results page with the query
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
        Search LTV alumni by name, company, position, expertise, or location:
      </div>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Founder, Product Manager, Amazon, Marketing, Manufacturing, New York, etc."
          className="pr-12 py-6 text-base"
          disabled={isSubmitting}
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 gradient-button rounded-lg p-2 text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2 disabled:opacity-70"
          aria-label="Search"
          disabled={isSubmitting}
        >
          {isSubmitting ? 
            <Loader2 size={20} className="animate-spin" /> : 
            <Search size={20} />
          }
        </button>
      </form>
    </div>
  );
};

export default SearchBox;
