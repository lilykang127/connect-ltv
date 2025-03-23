
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react';
import { getAlumniById } from '@/services/alumniService';
import { AlumniData } from '@/components/AlumniCard';
import Logo from '@/components/Logo';
import { useToast } from "@/components/ui/use-toast";

const AlumniProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [alumni, setAlumni] = useState<AlumniData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlumniData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const alumniId = parseInt(id);
        const data = await getAlumniById(alumniId);
        
        if (data) {
          setAlumni(data);
        } else {
          toast({
            title: "Profile Not Found",
            description: "The alumni profile you are looking for could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching alumni profile:', error);
        toast({
          title: "Error",
          description: "Failed to load the alumni profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumniData();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <header className="container mx-auto py-6 px-4">
          <Logo />
        </header>
        <main className="container mx-auto flex-1 px-4 py-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-connect-blue border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <header className="container mx-auto py-6 px-4">
          <Logo />
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">The alumni profile you are looking for could not be found.</p>
            <button 
              onClick={() => navigate('/')}
              className="gradient-button py-2 px-4 rounded-lg text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-connect-blue transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 card-shadow">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-connect-blue to-connect-violet text-white text-2xl font-bold">
                  {alumni.name.split(' ').map(part => part[0]).join('')}
                </div>
                <div className="ml-5">
                  <h1 className="text-2xl font-bold text-gray-900">{alumni.name}</h1>
                  <p className="text-lg text-gray-600">{alumni.position} at {alumni.company}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail size={18} className="mr-2" />
                    <a href={`mailto:${alumni.email}`} className="text-connect-blue hover:underline">
                      {alumni.email}
                    </a>
                  </div>
                  {alumni.linkedIn && (
                    <div className="flex items-center text-gray-600">
                      <ExternalLink size={18} className="mr-2" />
                      <a 
                        href={alumni.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-connect-blue hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Expertise & Background</h2>
                <p className="text-gray-700">
                  {alumni.relevance}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => window.location.href = `mailto:${alumni.email}`}
                className="gradient-button py-3 px-6 rounded-lg text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-connect-blue focus:ring-offset-2"
              >
                Contact {alumni.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ConnectLTV. Harvard Business School. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AlumniProfile;
