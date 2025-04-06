
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlumniById, getLinkedInScrapeData } from '@/services/alumniService';
import { AlumniData } from '@/components/AlumniCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, Linkedin, Mail, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import EmailDraftDialog from '@/components/EmailDraftDialog';

const AlumniProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [alumni, setAlumni] = useState<AlumniData | null>(null);
  const [linkedInData, setLinkedInData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const alumniData = await getAlumniById(parseInt(id));
          setAlumni(alumniData);
          if (!alumniData) {
            setError('Alumni not found');
          }
        }
      } catch (err) {
        console.error('Error fetching alumni:', err);
        setError('Failed to load alumni data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumni();
  }, [id]);

  useEffect(() => {
    const fetchLinkedInData = async () => {
      if (id) {
        setLoadingLinkedIn(true);
        try {
          const scrapeData = await getLinkedInScrapeData(parseInt(id));
          setLinkedInData(scrapeData);
        } catch (err) {
          console.error('Error fetching LinkedIn data:', err);
        } finally {
          setLoadingLinkedIn(false);
        }
      }
    };

    fetchLinkedInData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Alumni not found'}</AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to search</Link>
        </Button>
      </div>
    );
  }

  // Format LinkedIn data for display
  const formatLinkedInData = (data: string) => {
    // Split by section headers and process each section
    const sections = data.split(/About:|Experience:|Education:/g).filter(section => section.trim());
    
    if (sections.length < 3) {
      // Fallback if the data doesn't match expected format
      return <pre className="whitespace-pre-wrap text-sm">{data}</pre>;
    }
    
    const aboutSection = sections[0];
    const experienceSection = sections[1];
    const educationSection = sections[2];
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">About</h3>
          <p className="text-sm">{aboutSection.trim() || "No information available"}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Experience</h3>
          {experienceSection.trim() ? (
            <div className="text-sm whitespace-pre-line">{experienceSection.trim()}</div>
          ) : (
            <p className="text-sm text-gray-500">No experience information available</p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Education</h3>
          {educationSection.trim() ? (
            <div className="text-sm whitespace-pre-line">{educationSection.trim()}</div>
          ) : (
            <p className="text-sm text-gray-500">No education information available</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Button asChild variant="outline" className="mb-6">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to search</Link>
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex-shrink-0 w-20 h-20 mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-connect-blue to-connect-violet text-white text-2xl font-bold">
                {alumni.name.split(' ').map(part => part[0]).join('')}
              </div>
              <CardTitle className="text-2xl">{alumni.name}</CardTitle>
              <CardDescription className="text-lg font-medium mt-1">
                {alumni.position} {alumni.company ? `at ${alumni.company}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {alumni.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{alumni.email}</span>
                </div>
              )}
              {alumni.linkedIn && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                  <a 
                    href={alumni.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <div className="grid grid-cols-2 gap-3 w-full">
                {alumni.email && (
                  <EmailDraftDialog 
                    email={alumni.email} 
                    name={alumni.name} 
                    trigger={
                      <Button className="w-full">
                        <Mail className="mr-2 h-4 w-4" /> Email
                      </Button>
                    } 
                  />
                )}
                {alumni.linkedIn && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={alumni.linkedIn} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" /> View
                    </a>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="linkedin" disabled={!linkedInData}>
                LinkedIn Data
                {loadingLinkedIn && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {alumni.relevance && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">About</h3>
                        <p>{alumni.relevance}</p>
                      </div>
                    )}
                    
                    {!alumni.relevance && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Limited Information</AlertTitle>
                        <AlertDescription>
                          We have limited information about this alumni.
                          {!linkedInData && alumni.linkedIn && " Check back later for LinkedIn data."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="linkedin">
              <Card>
                <CardHeader>
                  <CardTitle>LinkedIn Information</CardTitle>
                  <CardDescription>Extracted from LinkedIn profile</CardDescription>
                </CardHeader>
                <CardContent>
                  {linkedInData ? (
                    formatLinkedInData(linkedInData)
                  ) : (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
