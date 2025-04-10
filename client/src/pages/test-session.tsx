import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight, ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TestSession() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch test details
  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: [`/api/tests/${id}`],
    enabled: !!id,
  });
  
  // Fetch questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/tests/${id}/questions`],
    enabled: !!id,
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Initialize timer when test data loads
  useEffect(() => {
    if (test?.duration) {
      setTimeLeft(test.duration * 60); // Convert minutes to seconds
    }
  }, [test]);
  
  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || testCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Time's up!",
            description: "Your test has been submitted automatically.",
            variant: "destructive",
          });
          setTestCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, testCompleted, toast]);
  
  // Format time display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const goToNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const submitTest = () => {
    // In a real implementation, we would submit the answers to the server
    setTestCompleted(true);
    toast({
      title: "Test Submitted",
      description: "Your answers have been recorded.",
    });
  };
  
  const calculateProgress = () => {
    if (!questions) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };
  
  if (testLoading || questionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!test || !questions) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Test Not Found</h1>
          <p className="text-gray-600 mb-6">The test you're looking for doesn't exist or isn't available.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }
  
  // Display test completion screen
  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center bg-primary/5 rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Test Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-center mb-4">Thank you for completing the test!</h2>
              <p className="text-center text-muted-foreground mb-8">
                Your responses have been recorded. You may now exit this page.
              </p>
              <div className="flex flex-col items-center space-y-4">
                <Button className="min-w-[200px]" onClick={() => navigate('/')}>Return Home</Button>
                <Button variant="outline" className="min-w-[200px]" onClick={() => navigate('/practice-tests')}>
                  Go to All Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        {/* Test Header */}
        <Card className="mb-6">
          <CardHeader className="bg-background py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-bold">{test.title}</h1>
                <p className="text-muted-foreground">{questions.length} Questions • {test.totalMarks} Marks</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                <Button variant="default" onClick={submitTest}>
                  Submit Test
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-sm bg-muted px-3 py-1 rounded-md">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="font-medium text-sm bg-primary/10 text-primary px-3 py-1 rounded-md">
                    {currentQuestion.marks} Marks
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-lg mb-3">{currentQuestion.questionText}</p>
                  {currentQuestion.imageUrl && (
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question" 
                      className="max-w-full max-h-[300px] object-contain my-4 rounded-md border" 
                    />
                  )}
                </div>
                
                {/* Render different answer inputs based on question type */}
                {currentQuestion.questionType === 'mcq' && (
                  <RadioGroup 
                    value={answers[currentQuestion.id] || ''} 
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {currentQuestion.options && currentQuestion.options.map((option: any) => (
                      <div key={option.id} className="flex items-start space-x-2 rounded-md border border-muted p-3">
                        <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                          {option.optionText}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.questionType === 'fill-blank' && (
                  <div className="space-y-4">
                    <Label htmlFor="answer">Your Answer</Label>
                    <Input 
                      id="answer" 
                      value={answers[currentQuestion.id] || ''} 
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here" 
                    />
                  </div>
                )}
                
                {currentQuestion.questionType === 'subjective' && (
                  <div className="space-y-4">
                    <Label htmlFor="answer">Your Answer</Label>
                    <Textarea 
                      id="answer" 
                      value={answers[currentQuestion.id] || ''} 
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Write your answer here" 
                      rows={6} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              
              <Button 
                variant="outline" 
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Question Navigator */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Test Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={calculateProgress()} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(answers).length} of {questions.length} questions answered
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question: any, index: number) => (
                      <Button 
                        key={question.id}
                        variant={index === currentQuestionIndex ? "default" : answers[question.id] ? "outline" : "ghost"}
                        className={`h-10 w-10 p-0 ${index === currentQuestionIndex ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Total Questions:</div>
                  <div>{questions.length}</div>
                  
                  <div className="font-medium">Total Marks:</div>
                  <div>{test.totalMarks}</div>
                  
                  <div className="font-medium">Passing Marks:</div>
                  <div>{test.passingMarks}</div>
                  
                  <div className="font-medium">Time Limit:</div>
                  <div>{test.duration} minutes</div>
                  
                  {test.negativeMarking > 0 && (
                    <>
                      <div className="font-medium">Negative Marking:</div>
                      <div>{test.negativeMarking} marks</div>
                    </>
                  )}
                </div>
                
                {test.instructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-2">Instructions:</p>
                      <p className="text-muted-foreground text-xs whitespace-pre-line">{test.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}