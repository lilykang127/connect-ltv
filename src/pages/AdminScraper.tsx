
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema validation
const scraperFormSchema = z.object({
  batchSize: z.number().min(1).max(20).default(5),
});

type ScraperFormValues = z.infer<typeof scraperFormSchema>;

const AdminScraper = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();

  // Initialize form
  const form = useForm<ScraperFormValues>({
    resolver: zodResolver(scraperFormSchema),
    defaultValues: {
      batchSize: 5,
    },
  });

  // Function to start the scraping process
  const startScraping = async (values: ScraperFormValues) => {
    try {
      setIsRunning(true);
      setStatus('running');
      setStatusMessage('Initializing LinkedIn data simulation...');
      
      // Start the scraping process
      const response = await supabase.functions.invoke('linkedin-scraper', {
        body: { limit: values.batchSize },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'An error occurred during the process');
      }
      
      const { data } = response;
      
      setProgress({
        completed: data.completed || 0,
        total: data.total || 0
      });
      
      if (data.error) {
        setStatus('error');
        setStatusMessage(data.error);
        toast({
          title: "Process Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setStatus('completed');
        setStatusMessage(data.message || 'Data simulation completed successfully');
        toast({
          title: "Process Completed",
          description: `Successfully processed ${data.completed} out of ${data.total} profiles.`,
        });
      }
    } catch (error) {
      console.error('Error running LinkedIn simulator:', error);
      setStatus('error');
      setStatusMessage(error.message || 'An unexpected error occurred');
      toast({
        title: "Process Error",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  // Get stats about profiles
  const [stats, setStats] = useState({ total: 0, scraped: 0, notScraped: 0 });
  
  React.useEffect(() => {
    const fetchStats = async () => {
      // Get total count
      const { count: total } = await supabase
        .from('LTV Alumni Database')
        .select('*', { count: 'exact', head: true });
      
      // Get count of scraped profiles
      const { count: scraped } = await supabase
        .from('LTV Alumni Database')
        .select('*', { count: 'exact', head: true })
        .not('LinkedIn Scrape', 'is', null);
      
      // Get count of not scraped profiles with LinkedIn URLs
      const { count: notScraped } = await supabase
        .from('LTV Alumni Database')
        .select('*', { count: 'exact', head: true })
        .is('LinkedIn Scrape', null)
        .not('LinkedIn URL', 'is', null);
      
      setStats({
        total: total || 0,
        scraped: scraped || 0,
        notScraped: notScraped || 0
      });
    };
    
    fetchStats();
  }, [status]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">LinkedIn Profile Data Generator</h1>
      
      <Alert variant="default" className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription>
          This is running in simulation mode. Real LinkedIn scraping requires browser automation which 
          isn't supported in this environment. The system will generate placeholder data instead.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profiles with Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.scraped}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Profiles</CardTitle>
              <CardDescription>With LinkedIn URLs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.notScraped}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Processor config and control */}
        <Card>
          <CardHeader>
            <CardTitle>Generate LinkedIn Profile Data</CardTitle>
            <CardDescription>
              This will create sample LinkedIn data for alumni where we have URLs but no data yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(startScraping)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="batchSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          disabled={isRunning}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of profiles to process in this batch (1-20 recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Processing'
                  )}
                </Button>
              </form>
            </Form>
            
            {/* Status and progress */}
            {status !== 'idle' && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  {status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                  {status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  <span className={`font-medium ${
                    status === 'error' ? 'text-red-500' : 
                    status === 'completed' ? 'text-green-500' : 
                    'text-blue-500'
                  }`}>
                    {statusMessage}
                  </span>
                </div>
                
                {(status === 'running' || status === 'completed') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.completed} of {progress.total} profiles</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminScraper;
