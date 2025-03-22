
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Example {
  category: string;
  query: string;
}

const examples: Example[] = [
  {
    category: 'Career guidance',
    query: 'Debating between joining or founding a startup after HBS. Seeking insights from alumni 8-10 years out on both paths.'
  },
  {
    category: 'Seeking expertise',
    query: 'Need insights on early-stage enterprise SaaS for construction, focusing on workflow automation. Looking for experts in operations and workflow management.'
  },
  {
    category: 'Building partnership',
    query: 'Looking for senior leaders in restaurant finance for partnerships on an invoice automation startup.'
  }
];

interface SearchExamplesProps {
  onSelectExample?: (query: string) => void;
}

const SearchExamples: React.FC<SearchExamplesProps> = ({ onSelectExample }) => {
  const navigate = useNavigate();

  const handleExampleClick = (query: string) => {
    if (onSelectExample) {
      onSelectExample(query);
    } else {
      navigate(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="mb-3 text-sm font-medium text-gray-500">Examples</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {examples.map((example, index) => (
          <div 
            key={index}
            onClick={() => handleExampleClick(example.query)}
            className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-connect-blue"
          >
            <div className="text-xs font-semibold text-connect-blue mb-2">{example.category}</div>
            <div className="text-sm text-gray-700 line-clamp-3">{example.query}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchExamples;
