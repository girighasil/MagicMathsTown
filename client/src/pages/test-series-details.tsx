import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft, Tag, BookOpen, Award, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Test {
  id: number;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: string;
  isActive: boolean;
}

interface TestSeries {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  features: string[];
  testCount: number;
  isPublished: boolean;
}

export default function TestSeriesDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('about');

  // Fetch test series details
  const { data: testSeries, isLoading: isSeriesLoading } = useQuery<TestSeries>({
    queryKey: [`/api/test-series/${id}`],
    enabled: !!id,
  });

  // Fetch tests in this series
  const { data: tests, isLoading: isTestsLoading } = useQuery<Test[]>({
    queryKey: [`/api/test-series/${id}/tests`],
    enabled: !!id,
  });

  // Set page title based on test series name
  useEffect(() => {
    if (testSeries) {
      document.title = `${testSeries.title} - Maths Magic Town`;
    }
    return () => {
      document.title = 'Maths Magic Town';
    };
  }, [testSeries]);

  const handleStartTest = (testId: number) => {
    navigate(`/test-taking/${testId}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (isSeriesLoading || isTestsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-gray-600">Loading test series...</p>
        </div>
      </div>
    );
  }

  if (!testSeries) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Series Not Found</h2>
          <p className="text-gray-600 mb-6">The test series you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" onClick={handleGoBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Test Series Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{testSeries.title}</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {testSeries.testCount} Tests
            </Badge>
          </div>
          <p className="text-gray-600 mb-4 max-w-3xl">{testSeries.description}</p>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2 text-primary" />
              <span>Category: {testSeries.category || 'General'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4 mr-2 text-primary" />
              <span>{testSeries.testCount} Included Tests</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-2 text-primary" />
              <span>₹{testSeries.price.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex space-x-6">
          <button
            className={`pb-2 px-1 ${
              activeTab === 'about'
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'tests'
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('tests')}
          >
            Tests
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'about' && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">About this Test Series</h2>
          <p className="mb-6">{testSeries.description}</p>

          <h3 className="text-lg font-medium mb-3">Features</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            {testSeries.features.map((feature, index) => (
              <li key={index} className="text-gray-700">{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'tests' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Available Tests</h2>
          
          {tests && tests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.map((test) => (
                <Card key={test.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{test.title}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{test.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{test.totalMarks} marks</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Passing: {test.passingMarks} marks</p>
                      <p>Negative Marking: {test.negativeMarking}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartTest(test.id)}
                      disabled={!test.isActive}
                    >
                      Start Test
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-600">No tests available in this series yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}