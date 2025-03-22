
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/">
      <div className="flex items-center space-x-2 group">
        <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-connect-blue to-connect-violet rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-110">
          <div className="text-white font-bold text-xl">C</div>
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </div>
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-connect-blue to-connect-violet">
          ConnectLTV
        </div>
      </div>
    </Link>
  );
};

export default Logo;
