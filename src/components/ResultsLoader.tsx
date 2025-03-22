
import React from 'react';

const ResultsLoader: React.FC = () => {
  const skeletons = Array(5).fill(null);

  return (
    <div className="space-y-6 w-full">
      {skeletons.map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 shimmer"></div>
              <div className="ml-4">
                <div className="h-5 w-40 bg-gray-200 rounded shimmer"></div>
                <div className="h-4 w-60 mt-2 bg-gray-200 rounded shimmer"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="p-2 w-8 h-8 bg-gray-200 rounded shimmer"></div>
              <div className="p-2 w-8 h-8 bg-gray-200 rounded shimmer"></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="h-3 w-20 bg-gray-200 rounded mb-2 shimmer"></div>
            <div className="h-4 w-full bg-gray-200 rounded shimmer"></div>
            <div className="h-4 w-full mt-2 bg-gray-200 rounded shimmer"></div>
            <div className="h-4 w-3/4 mt-2 bg-gray-200 rounded shimmer"></div>
          </div>
          
          <div className="mt-6">
            <div className="h-10 w-full bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsLoader;
