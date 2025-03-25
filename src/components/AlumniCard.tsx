
import React, { useState } from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EmailDraftDialog from './EmailDraftDialog';

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
  searchQuery?: string;
  onClick?: () => void;
  category?: string;
}

const AlumniCard: React.FC<AlumniCardProps> = ({ alumni, searchQuery = '', onClick, category }) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // Open the default email client
    window.location.href = `mailto:${alumni.email}`;
    
    toast({
      title: "Email client opened",
      description: `Composing email to ${alumni.name}`,
      duration: 3000,
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 card-shadow card-hover animate-fade-in cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-connect-blue to-connect-violet text-white font-bold">
            {alumni.name.split(' ').map(part => part[0]).join('')}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{alumni.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Professional Experience: {alumni.position} at {alumni.company}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Why Relevant</div>
        <p className="text-gray-700">{alumni.relevance}</p>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        {alumni.linkedIn && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              window.open(alumni.linkedIn, '_blank');
            }}
          >
            <ExternalLink size={16} className="mr-1" />
            LinkedIn
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleEmailClick}
        >
          <Mail size={16} className="mr-1" />
          Email
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              Draft Intro Email
            </Button>
          </DialogTrigger>
          <EmailDraftDialog alumni={alumni} searchQuery={searchQuery} />
        </Dialog>
      </div>
    </div>
  );
};

export default AlumniCard;
