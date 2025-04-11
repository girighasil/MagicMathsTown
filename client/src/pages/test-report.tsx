import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2, Clock, CheckCircle, XCircle, HelpCircle, ArrowLeft, ChevronDown, ChevronUp, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { NavigationIcons } from "@/components/common/NavigationIcons";

interface UserAnswer {
  id: number;
  testAttemptId: number;
  questionId: number;
  answer: string;
  isCorrect: boolean;
  marksObtained: string;
  createdAt: string;
}

interface QuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
}

interface Explanation {
  id: number;
  questionId: number;
  explanation: string;
}

interface Question {
  id: number;
  testId: number;
  questionText: string;
  questionType: string;
  marks: number;
  options: QuestionOption[];
  explanation: Explanation | null;
  userAnswer: UserAnswer | null;
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

interface TestReportData {
  testAttempt: TestAttempt;
  questions: Question[];
}

// Format seconds to hours, minutes, seconds
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const pad = (num: number) => (num < 10 ? `0${num}` : num.toString());
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

export default function TestReport() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  
  // Fetch test attempt details
  // Fetch test attempt details
  const { data, isLoading, error } = useQuery<TestReportData>({
    queryKey: ["/api/test-attempts", attemptId],
    queryFn: async () => {
      const response = await fetch(`/api/test-attempts/${attemptId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test attempt details");
      }
      return await response.json();
    },
    enabled: !!attemptId && !!user,
  });
  
  // Fetch test details to get the testSeriesId
  const { data: testData } = useQuery<{ testSeriesId: number }>({
    queryKey: ["/api/tests", data?.testAttempt.testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${data?.testAttempt.testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test details");
      }
      return await response.json();
    },
    enabled: !!data?.testAttempt.testId,
  });
  
  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => 
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  // Filter questions by status (correct, incorrect, unanswered)
  const getFilteredQuestions = (filter: 'all' | 'correct' | 'incorrect' | 'unanswered') => {
    if (!data?.questions) return [];
    
    switch (filter) {
      case 'correct':
        return data.questions.filter(q => q.userAnswer?.isCorrect);
      case 'incorrect':
        return data.questions.filter(q => q.userAnswer && !q.userAnswer.isCorrect);
      case 'unanswered':
        return data.questions.filter(q => !q.userAnswer);
      case 'all':
      default:
        return data.questions;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading test report...</span>
      </div>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-start mb-4">
          <NavigationIcons previousPath="/test-series" previousLabel="Back to Test Series" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load test report. The test attempt may not exist or you don't have permission to view it.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/test-series")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Test Series
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const { testAttempt, questions } = data;
  const hasPassed = testAttempt.score !== null && parseFloat(testAttempt.score) >= testAttempt.test.passingMarks;
  
  // Calculate percentages
  const correctPercentage = testAttempt.correctAnswers ? (testAttempt.correctAnswers / questions.length) * 100 : 0;
  const incorrectPercentage = testAttempt.incorrectAnswers ? (testAttempt.incorrectAnswers / questions.length) * 100 : 0;
  const unansweredPercentage = testAttempt.unanswered ? (testAttempt.unanswered / questions.length) * 100 : 0;
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Navigation Icons */}
      <div className="flex justify-between items-center mb-4">
        <NavigationIcons 
          previousPath={testData?.testSeriesId ? `/test-series/${testData.testSeriesId}` : "/test-series"} 
          previousLabel="Back to Test Series" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Test Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{testAttempt.test.title}</CardTitle>
            <CardDescription>{testAttempt.test.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date Taken</p>
                <p>{new Date(testAttempt.startTime).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Time Taken</p>
                <p className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {testAttempt.timeTaken ? formatTime(testAttempt.timeTaken) : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p>{questions.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p>{testAttempt.totalMarks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Passing Marks</p>
                <p>{testAttempt.test.passingMarks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Negative Marking</p>
                <p>{parseFloat(testAttempt.test.negativeMarking) * 100}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Score Card */}
        <Card className={hasPassed ? "border-green-200 bg-green-50 dark:bg-green-950/10" : "border-red-200 bg-red-50 dark:bg-red-950/10"}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Score</span>
              {hasPassed ? (
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <Medal className="h-3 w-3 mr-1" /> Passed
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">
                  <XCircle className="h-3 w-3 mr-1" /> Failed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-2">
              {testAttempt.score !== null ? parseFloat(testAttempt.score).toFixed(2) : "0"} / {testAttempt.totalMarks}
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${testAttempt.percentage !== null ? parseFloat(testAttempt.percentage) : 0}%` }}
              ></div>
            </div>
            <div className="text-lg">
              {testAttempt.percentage !== null ? parseFloat(testAttempt.percentage).toFixed(2) : "0"}%
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>{testAttempt.correctAnswers || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>{testAttempt.incorrectAnswers || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  <span>{testAttempt.unanswered || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Unanswered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  Correct ({testAttempt.correctAnswers || 0})
                </span>
                <span className="text-sm">{correctPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-600 h-full rounded-full" 
                  style={{ width: `${correctPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm flex items-center">
                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                  Incorrect ({testAttempt.incorrectAnswers || 0})
                </span>
                <span className="text-sm">{incorrectPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full rounded-full" 
                  style={{ width: `${incorrectPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                  Unanswered ({testAttempt.unanswered || 0})
                </span>
                <span className="text-sm">{unansweredPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gray-400 h-full rounded-full" 
                  style={{ width: `${unansweredPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Question Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Questions ({questions.length})</TabsTrigger>
              <TabsTrigger value="correct">Correct ({testAttempt.correctAnswers || 0})</TabsTrigger>
              <TabsTrigger value="incorrect">Incorrect ({testAttempt.incorrectAnswers || 0})</TabsTrigger>
              <TabsTrigger value="unanswered">Unanswered ({testAttempt.unanswered || 0})</TabsTrigger>
            </TabsList>
            
            {['all', 'correct', 'incorrect', 'unanswered'].map((filter) => (
              <TabsContent key={filter} value={filter} className="space-y-4">
                {getFilteredQuestions(filter as 'all' | 'correct' | 'incorrect' | 'unanswered').map((question, index) => (
                  <Collapsible
                    key={question.id}
                    open={expandedQuestions.includes(question.id)}
                    onOpenChange={() => toggleQuestion(question.id)}
                    className="border rounded-lg"
                  >
                    <div className={`p-4 flex items-start justify-between ${
                      question.userAnswer?.isCorrect 
                        ? 'bg-green-50 dark:bg-green-950/10' 
                        : question.userAnswer
                          ? 'bg-red-50 dark:bg-red-950/10'
                          : 'bg-gray-50 dark:bg-gray-800/10'
                    }`}>
                      <div className="flex items-start gap-2">
                        <div className="bg-background rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0 border">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{question.questionText}</div>
                          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 mt-1">
                            <span>Marks: {question.marks}</span>
                            {question.userAnswer && (
                              <span className={question.userAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {question.userAnswer.isCorrect 
                                  ? `+${parseFloat(question.userAnswer.marksObtained).toFixed(2)}` 
                                  : parseFloat(question.userAnswer.marksObtained).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {question.userAnswer?.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : question.userAnswer ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                            {expandedQuestions.includes(question.id) 
                              ? <ChevronUp className="h-4 w-4" /> 
                              : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="p-4 pt-2 border-t">
                        {/* Options */}
                        <div className="space-y-2 mb-4">
                          <p className="font-medium text-sm">Options:</p>
                          {question.options.map((option) => {
                            const isSelected = question.userAnswer?.answer === option.id.toString();
                            let optionClass = "";
                            
                            if (option.isCorrect) {
                              optionClass = "bg-green-50 dark:bg-green-950/10 border-green-200";
                            } else if (isSelected) {
                              optionClass = "bg-red-50 dark:bg-red-950/10 border-red-200";
                            }
                            
                            return (
                              <div 
                                key={option.id} 
                                className={`p-2 rounded border ${optionClass} flex items-center gap-2`}
                              >
                                {isSelected ? (
                                  option.isCorrect ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )
                                ) : option.isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <div className="h-4 w-4" />
                                )}
                                <span>{option.text}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Explanation */}
                        {question.explanation && (
                          <div className="mt-4">
                            <p className="font-medium text-sm">Explanation:</p>
                            <div className="p-3 bg-secondary/20 rounded mt-1">
                              {question.explanation.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                
                {getFilteredQuestions(filter as 'all' | 'correct' | 'incorrect' | 'unanswered').length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No questions in this category
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={() => testData?.testSeriesId ? navigate(`/test-series/${testData.testSeriesId}`) : navigate("/test-series")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Test Series
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}