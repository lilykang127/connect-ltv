
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  onSearch?: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/results?q=${encodeURIComponent(query)}`);
      }
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
        />
        <button 
          type="submit"
          className="absolute right-3 bottom-3 gradient-button rounded-lg p-3 text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2"
          aria-label="Search"
        >
          <span><Search size={20} /></span>
        </button>
      </form>
    </div>
  );
};

export default SearchBox;
