
import React from 'react';
import Logo from '@/components/Logo';
import SearchBox from '@/components/SearchBox';
import SearchExamples from '@/components/SearchExamples';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <header className="container mx-auto py-6">
        <Logo />
      </header>

      <main className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-connect-blue to-connect-violet">
            ConnectLTV
          </h1>
          <p className="text-gray-700 md:text-lg max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            Welcome to ConnectLTV – your gateway to a dynamic network of Harvard Business School's Launching Tech Venture alumni. 
            Seeking career guidance, startup feedback, go-to-market expertise, or more? Simply type your query, 
            and ConnectLTV will identify the alumni best suited to support you. Connect, collaborate, 
            and innovate like never before with ConnectLTV!
          </p>
        </div>

        <div className="w-full animate-slide-up" style={{ animationDelay: '400ms' }}>
          <SearchBox />
        </div>

        <div className="w-full animate-slide-up" style={{ animationDelay: '600ms' }}>
          <SearchExamples />
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ConnectLTV. Harvard Business School. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
