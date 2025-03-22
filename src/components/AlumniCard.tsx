
import React, { useState } from 'react';
import { ExternalLink, Mail, ArrowRight, Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export interface AlumniData {
  id: number;
  name: string;
  position: string;
  company: string;
  relevance: string;
  email: string;
  linkedIn: string;
}

interface AlumniCardProps {
  alumni: AlumniData;
  rank: number;
  searchQuery?: string;
}

const AlumniCard: React.FC<AlumniCardProps> = ({ alumni, rank, searchQuery = '' }) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleEmailDraft = () => {
    // Generate an email subject based on the search query
    const subject = encodeURIComponent(`Request for advice from a fellow HBS LTV alum`);
    
    // Generate an email body with personalized content
    const introLines = [
      `Hi ${alumni.name.split(' ')[0]},`,
      '',
      `I hope this email finds you well. I'm reaching out as a fellow Harvard Business School LTV alum seeking some advice.`,
      '',
      `I noticed your experience as ${alumni.position} at ${alumni.company} and thought you might be able to provide some insights regarding ${searchQuery}.`,
      '',
      `Would you be open to a brief conversation to share your perspective? I'd really appreciate your expertise on this topic.`,
      '',
      `Thank you for considering, and I look forward to potentially connecting.`,
      '',
      `Best regards,`,
      `[Your Name]`
    ];
    
    const body = encodeURIComponent(introLines.join('\n'));
    
    // Open the default email client with pre-filled content
    window.location.href = `mailto:${alumni.email}?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email draft created",
      description: `A draft email to ${alumni.name} has been prepared with a personalized introduction.`,
      duration: 3000,
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 card-shadow card-hover animate-fade-in"
      style={{ animationDelay: `${rank * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-connect-blue to-connect-violet text-white font-bold">
            {alumni.name.split(' ').map(part => part[0]).join('')}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{alumni.name}</h3>
            <p className="text-sm text-gray-600">{alumni.position} at {alumni.company}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {alumni.linkedIn && (
            <a 
              href={alumni.linkedIn} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-connect-blue transition-colors"
              aria-label="LinkedIn Profile"
            >
              <ExternalLink size={18} />
            </a>
          )}
          <a 
            href={`mailto:${alumni.email}`}
            className="p-2 text-gray-500 hover:text-connect-blue transition-colors"
            aria-label="Email directly"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Relevance</div>
        <p className="text-gray-700">{alumni.relevance}</p>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={handleEmailDraft}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center transition-all ${
            isHovered 
              ? 'gradient-button text-white' 
              : 'bg-white text-connect-blue border border-connect-blue'
          }`}
        >
          <span>Draft an intro email</span>
          <Send size={16} className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default AlumniCard;
