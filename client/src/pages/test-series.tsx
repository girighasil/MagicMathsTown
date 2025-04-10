import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, BookOpen, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TestSeries {
  id: number;
  title: string;
  description: string;
  features: string[];
  price: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function TestSeriesPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch all published test series
  const { data: testSeries, isLoading } = useQuery<TestSeries[]>({
    queryKey: ['/api/test-series'],
  });
  
  // Loading state
  if (isLoading || isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-gray-600">Loading test series...</p>
        </div>
      </div>
    );
  }
  
  // Check if there are no test series
  if (!testSeries || testSeries.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Test Series</h1>
          <p className="text-gray-600 mb-6">
            No test series available at the moment. Please check back later.
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Available Test Series</h1>
        <p className="text-gray-600">
          Prepare for your exams with our comprehensive test series. Practice with real exam-like questions and track your progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {testSeries.map((series) => (
          <Card key={series.id} className="flex flex-col h-full border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl text-primary">{series.title}</CardTitle>
                <Badge variant="outline" className="bg-primary/5">
                  Test Series
                </Badge>
              </div>
              <CardDescription>{series.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Key Features:</h4>
                <ul className="space-y-2 pl-5 list-disc text-sm text-gray-600">
                  {series.features?.slice(0, 3).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                  {series.features?.length > 3 && (
                    <li className="text-primary">
                      +{series.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate(`/test-series/${series.id}`)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="bg-primary/5 rounded-lg p-6 border border-primary/10 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-primary" />
          Why Practice with Our Test Series?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Timed Practice</h3>
              <p className="text-sm text-gray-600">
                Experience real exam pressure with our timed tests that simulate actual exam conditions.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Monitor your performance with detailed analytics and identify areas for improvement.
              </p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full md:w-auto mt-2"
          onClick={() => navigate('/')}
        >
          Learn More About Our Courses
        </Button>
      </div>
    </div>
  );
}