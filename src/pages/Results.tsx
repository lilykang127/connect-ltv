
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import AlumniCard, { AlumniData } from '@/components/AlumniCard';
import ResultsLoader from '@/components/ResultsLoader';

// Mock data - in a real application, this would come from your backend
const mockAlumniData: AlumniData[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    position: 'VP of Product',
    company: 'EdTech Innovations',
    relevance: 'Sarah has 8+ years experience in go-to-market strategies for education software. She led the launch of 3 enterprise SaaS products in the US education sector.',
    email: 'sarah.johnson@example.com',
    linkedIn: 'https://linkedin.com/in/sarah-johnson'
  },
  {
    id: 2,
    name: 'Michael Chen',
    position: 'Founder & CEO',
    company: 'LearnSphere',
    relevance: 'Michael founded an enterprise software company in the education space after HBS and has deep expertise in US K-12 market entry strategies.',
    email: 'michael.chen@example.com',
    linkedIn: 'https://linkedin.com/in/michael-chen'
  },
  {
    id: 3,
    name: 'Jessica Rivera',
    position: 'Director of Sales',
    company: 'Scholastic Tech',
    relevance: 'Jessica specializes in enterprise sales for education software with particular focus on district-level decision making and procurement.',
    email: 'jessica.rivera@example.com',
    linkedIn: 'https://linkedin.com/in/jessica-rivera'
  },
  {
    id: 4,
    name: 'David Thompson',
    position: 'Partner',
    company: 'Education Ventures',
    relevance: 'David invests in early-stage education technology companies and has advised numerous startups on go-to-market strategies in the education sector.',
    email: 'david.thompson@example.com',
    linkedIn: 'https://linkedin.com/in/david-thompson'
  },
  {
    id: 5,
    name: 'Emily Nakamura',
    position: 'Chief Marketing Officer',
    company: 'ClassTech',
    relevance: 'Emily has led marketing for several education SaaS products and has expertise in positioning enterprise software to education institutions.',
    email: 'emily.nakamura@example.com',
    linkedIn: 'https://linkedin.com/in/emily-nakamura'
  },
  {
    id: 6,
    name: 'Robert Washington',
    position: 'Head of Business Development',
    company: 'EduGrowth',
    relevance: 'Robert specializes in partnership strategies for education technology companies selling to both K-12 and higher education markets.',
    email: 'robert.washington@example.com',
    linkedIn: 'https://linkedin.com/in/robert-washington'
  },
  {
    id: 7,
    name: 'Lisa Patel',
    position: 'Product Manager',
    company: 'SchoolSphere',
    relevance: 'Lisa managed the development and launch of an enterprise SaaS platform for school districts and has experience with user research in education.',
    email: 'lisa.patel@example.com',
    linkedIn: 'https://linkedin.com/in/lisa-patel'
  },
  {
    id: 8,
    name: 'James Wilson',
    position: 'Strategy Director',
    company: 'Education First Consulting',
    relevance: 'James consults for education technology companies on market entry and expansion strategies across the US education sector.',
    email: 'james.wilson@example.com',
    linkedIn: 'https://linkedin.com/in/james-wilson'
  },
  {
    id: 9,
    name: 'Angela Martinez',
    position: 'Customer Success Lead',
    company: 'LearnWare',
    relevance: 'Angela built the customer success function for an education SaaS company and has extensive knowledge of implementation needs within school districts.',
    email: 'angela.martinez@example.com',
    linkedIn: 'https://linkedin.com/in/angela-martinez'
  },
  {
    id: 10,
    name: 'Daniel Kim',
    position: 'Operations Director',
    company: 'EducateNow',
    relevance: 'Daniel has expertise in scaling operations for early-stage education technology companies selling enterprise solutions to schools and districts.',
    email: 'daniel.kim@example.com',
    linkedIn: 'https://linkedin.com/in/daniel-kim'
  }
];

const Results: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<AlumniData[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    // Simulate API call to fetch results
    const fetchResults = async () => {
      setIsLoading(true);
      // In a real application, you would make an API call here
      // For now, we'll just use the mock data with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResults(mockAlumniData);
      setIsLoading(false);
    };

    fetchResults();
  }, [query]);

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
          </div>

          {isLoading ? (
            <ResultsLoader />
          ) : (
            <div className="space-y-6">
              {results.map((alumni, index) => (
                <AlumniCard key={alumni.id} alumni={alumni} rank={index} />
              ))}
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
