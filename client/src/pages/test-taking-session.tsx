import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const pad = (num: number) => (num < 10 ? `0${num}` : num.toString());
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};

interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  createdAt: string;
}

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: QuestionOption[];
  marks: number;
  userAnswer?: {
    answer: string;
    isCorrect: boolean;
    marksObtained: string;
  } | null;
}

interface TestAttempt {
  id: number;
  testId: number;
  userId: number;
  startTime: string;
  endTime: string | null;
  isCompleted: boolean;
  totalMarks: number;
  score: string | null;
  timeTaken: number | null;
  correctAnswers: number | null;
  incorrectAnswers: number | null;
  unanswered: number | null;
  percentage: string | null;
  test: {
    id: number;
    title: string;
    description: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    negativeMarking: string;
    instructions: string;
  };
}

export default function TestTakingSession() {
  const { testId } = useParams<{ testId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  
  // Start test session
  const { data: testAttempt, isLoading: isTestAttemptLoading } = useQuery({
    queryKey: ["/api/tests", testId, "start"],
    queryFn: async () => {
      const response = await apiRequest("POST", `/api/tests/${testId}/start`);
      const data = await response.json();
      return data.testAttempt as TestAttempt;
    },
    enabled: !!testId && !!user,
  });
  
  // Fetch questions with their details directly
  const { data: questions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["/api/tests", testId, "questions"],
    queryFn: async () => {
      // First get the question IDs
      const response = await apiRequest("GET", `/api/tests/${testId}/questions`);
      const questionData = await response.json() as Question[];
      
      // For each question, fetch its complete data with options
      const questionsWithDetails = await Promise.all(
        questionData.map(async (question) => {
          try {
            const detailsResponse = await apiRequest("GET", `/api/questions/${question.id}`);
            const details = await detailsResponse.json();
            console.log(`Fetched details for question ${question.id}:`, details);
            return details;
          } catch (error) {
            console.error(`Error fetching details for question ${question.id}:`, error);
            return {
              ...question,
              options: []
            };
          }
        })
      );
      
      return questionsWithDetails;
    },
    enabled: !!testId,
  });
  
  const isQuestionIdsLoading = false; // Not needed anymore
  
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: string }) => {
      if (!testAttempt) return null;
      
      const response = await apiRequest("POST", `/api/test-attempts/${testAttempt.id}/submit-answer`, {
        questionId,
        answer,
      });
      
      return await response.json();
    },
    onSuccess: () => {
      // No need to invalidate cache here as we manage state locally
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Complete test mutation
  const completeTestMutation = useMutation({
    mutationFn: async () => {
      if (!testAttempt) return null;
      
      const response = await apiRequest("POST", `/api/test-attempts/${testAttempt.id}/complete`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/test-attempts"] });
      setTestEnded(true);
      navigate(`/test-report/${data.testAttempt.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete test",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Initialize timer when test attempt data is loaded
  useEffect(() => {
    if (testAttempt && testAttempt.test && !testEnded) {
      const duration = testAttempt.test.duration * 60; // convert to seconds
      const startTime = new Date(testAttempt.startTime).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remainingSeconds = Math.max(0, duration - elapsedSeconds);
      
      setTimeLeft(remainingSeconds);
      
      if (remainingSeconds <= 0) {
        handleTimeUp();
      }
    }
  }, [testAttempt]);
  
  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || !isTimerRunning || testEnded) return;
    
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [timeLeft, isTimerRunning, testEnded]);
  
  // Handler for when time is up
  const handleTimeUp = () => {
    setIsTimerRunning(false);
    toast({
      title: "Time's up!",
      description: "Your test is being submitted automatically.",
      variant: "default",
    });
    completeTestMutation.mutate();
  };
  
  const handleOptionSelect = (questionId: number, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    
    // Submit the answer immediately
    submitAnswerMutation.mutate({
      questionId,
      answer: optionId,
    });
  };
  
  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleCompleteTest = () => {
    setShowCompletionConfirm(true);
  };
  
  const confirmCompleteTest = () => {
    setShowCompletionConfirm(false);
    completeTestMutation.mutate();
  };
  
  const cancelCompleteTest = () => {
    setShowCompletionConfirm(false);
  };
  
  // Navigation to specific question
  const goToQuestion = (index: number) => {
    if (questions && index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  // Loading state
  if (isAuthLoading || isTestAttemptLoading || isQuestionsLoading || isQuestionIdsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading test session...</span>
      </div>
    );
  }
  
  // Authentication check
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // Debug info
  console.log("Test Attempt:", testAttempt);
  console.log("Questions:", questions);
  
  // Check if options are available for each question
  if (questions && questions.length > 0) {
    questions.forEach((q, i) => {
      console.log(`Question ${i+1} (ID: ${q.id}):`, q);
      if (q.options) {
        console.log(`  Options for question ${q.id}:`, q.options);
      } else {
        console.log(`  NO OPTIONS found for question ${q.id}`);
      }
    });
  }
  
  // Test attempt or questions not found
  if (!testAttempt || !questions || questions.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The test you're looking for doesn't exist or has no questions.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedOptions).length;
  const remainingCount = questions.length - answeredCount;
  
  return (
    <div className="container mx-auto py-2 px-4">
      {/* Header with test info and timer */}
      <div className="sticky top-0 bg-background z-10 pb-2 border-b mb-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">{testAttempt.test.title}</h1>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className={`text-lg font-semibold ${timeLeft && timeLeft < 300 ? 'text-destructive animate-pulse' : ''}`}>
              {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
            </span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-sm mt-1">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="flex gap-4">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-success" />
              {answeredCount} Answered
            </span>
            <span className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-muted-foreground" />
              {remainingCount} Remaining
            </span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Question panel */}
        <div className="w-full md:w-3/4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <span>{currentQuestion.questionText}</span>
              </CardTitle>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Type: {currentQuestion.questionType.toUpperCase()}</span>
                <span>Marks: {currentQuestion.marks}</span>
              </div>
            </CardHeader>
            <CardContent>
              {currentQuestion.questionType === 'mcq' && (
                <RadioGroup
                  value={selectedOptions[currentQuestion.id] || ""}
                  onValueChange={(value) => handleOptionSelect(currentQuestion.id, value)}
                >
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option: QuestionOption) => (
                      <div key={option.id} className="flex items-center space-x-2 mb-3 p-2 rounded hover:bg-secondary/20">
                        <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">{option.optionText}</Label>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 border rounded-md bg-secondary/10">
                      <p className="text-center text-muted-foreground">No options available for this question.</p>
                    </div>
                  )}
                </RadioGroup>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNextQuestion}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={handleCompleteTest}
                  disabled={completeTestMutation.isPending}
                >
                  {completeTestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Finish Test <Flag className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Question navigation panel */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant={currentQuestionIndex === index ? "default" : 
                             selectedOptions[question.id] ? "secondary" : "outline"}
                    className="h-10 w-10 p-0"
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCompleteTest}
                disabled={completeTestMutation.isPending}
              >
                {completeTestMutation.isPending ? "Submitting..." : "End Test"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showCompletionConfirm} onOpenChange={setShowCompletionConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to finish the test?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {remainingCount > 0 && ` There are still ${remainingCount} unanswered questions.`}
              You won't be able to return to the test after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelCompleteTest}>
              Continue Test
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCompleteTest}
              disabled={completeTestMutation.isPending}
            >
              {completeTestMutation.isPending ? "Submitting..." : "Submit Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}