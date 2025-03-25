
import React from 'react';
import { Copy } from 'lucide-react';
import { AlumniData } from './AlumniCard';
import { useToast } from "@/hooks/use-toast";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EmailDraftDialogProps {
  alumni: AlumniData;
  searchQuery: string;
}

const EmailDraftDialog: React.FC<EmailDraftDialogProps> = ({ alumni, searchQuery }) => {
  const { toast } = useToast();
  
  // Generate personalized email draft
  const generateEmailDraft = () => {
    const subject = `Request for advice from a fellow HBS LTV alum`;
    
    const emailBody = `
Hi ${alumni.name.split(' ')[0]},

I hope this email finds you well. I'm reaching out as a fellow Harvard Business School LTV alum seeking some advice.

I noticed your experience as ${alumni.position} at ${alumni.company} and thought you might be able to provide some insights regarding ${searchQuery || "my current professional journey"}.

${alumni.relevance ? `Your background in ${alumni.relevance} is particularly relevant to what I'm looking to learn more about.` : ''}

Would you be open to a brief conversation to share your perspective? I'd really appreciate your expertise on this topic.

Thank you for considering, and I look forward to potentially connecting.

Best regards,
[Your Name]
    `.trim();
    
    return { subject, body: emailBody };
  };
  
  const { subject, body } = generateEmailDraft();
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(body);
    toast({
      title: "Copied to clipboard",
      description: "Email draft has been copied to your clipboard",
      duration: 3000,
    });
  };
  
  const handleOpenEmailClient = () => {
    const emailSubject = encodeURIComponent(subject);
    const emailBody = encodeURIComponent(body);
    window.location.href = `mailto:${alumni.email}?subject=${emailSubject}&body=${emailBody}`;
    
    toast({
      title: "Email client opened",
      description: "Draft email has been prepared in your email client",
      duration: 3000,
    });
  };
  
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Email Draft to {alumni.name}</DialogTitle>
        <DialogDescription>
          A personalized introduction email based on your search and the alumni's background.
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 text-sm whitespace-pre-wrap">
        <div className="font-medium mb-2">Subject: {subject}</div>
        <div>{body}</div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCopyToClipboard}>
          <Copy size={16} className="mr-2" />
          Copy to Clipboard
        </Button>
        <Button onClick={handleOpenEmailClient}>
          Send Email
        </Button>
      </div>
    </DialogContent>
  );
};

export default EmailDraftDialog;
