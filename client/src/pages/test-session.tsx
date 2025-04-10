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
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define types for our data
interface Test {
  id: number;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  instructions?: string;
  testSeriesId: number;
  published: boolean;
}

interface Question {
  id: number;
  testId: number;
  questionText: string;
  questionType: 'mcq' | 'fill-blank' | 'subjective';
  marks: number;
  imageUrl?: string;
}

interface Option {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
}

interface Explanation {
  id: number;
  questionId: number;
  explanationText: string;
  imageUrl?: string;
}

interface QuestionDetails extends Question {
  options?: Option[];
  explanation?: Explanation;
}

export default function TestSession() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch test details
  const { data: test, isLoading: testLoading } = useQuery<Test>({
    queryKey: [`/api/tests/${id}`],
    enabled: !!id,
  });
  
  // Fetch questions list
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: [`/api/tests/${id}/questions`],
    enabled: !!id,
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showingReport, setShowingReport] = useState(false);
  const [allQuestionDetails, setAllQuestionDetails] = useState<Record<number, QuestionDetails>>({});
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Get the current question ID
  const currentQuestionId = questions && questions.length > 0 && currentQuestionIndex < questions.length 
    ? questions[currentQuestionIndex].id 
    : null;
  
  // Fetch detailed question data with options
  const { data: currentQuestionDetails, isLoading: detailsLoading } = useQuery<QuestionDetails>({
    queryKey: [`/api/questions/${currentQuestionId}`],
    enabled: !!currentQuestionId,
  });
  
  // Fetch all question details for report
  const fetchAllQuestionDetails = async () => {
    if (!questions || questions.length === 0) return;
    
    setLoadingReport(true);
    
    try {
      const fetchPromises = questions.map(question => 
        fetch(`/api/questions/${question.id}`).then(res => res.json())
      );
      
      const results = await Promise.all(fetchPromises);
      
      const detailsMap: Record<number, QuestionDetails> = {};
      results.forEach((result: QuestionDetails) => {
        detailsMap[result.id] = result;
      });
      
      setAllQuestionDetails(detailsMap);
    } catch (error) {
      console.error("Error fetching question details:", error);
      toast({
        title: "Error",
        description: "Failed to load question details for the report.",
        variant: "destructive"
      });
    } finally {
      setLoadingReport(false);
    }
  };
  
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
          fetchAllQuestionDetails();
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
    // Fetch all question details for report
    fetchAllQuestionDetails();
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
  
  // Calculate test score
  const calculateScore = () => {
    if (!questions || Object.keys(allQuestionDetails).length === 0) 
      return { score: 0, total: 0, percentage: 0, correctAnswers: 0, incorrectAnswers: 0, unansweredCount: 0, displayScore: "0.00" };
    
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach(question => {
      const questionMarks = question.marks || 0;
      totalPoints += questionMarks;
      
      // If question is not answered
      if (!answers[question.id]) {
        unansweredCount++;
        return;
      }
      
      const questionDetails = allQuestionDetails[question.id];
      if (!questionDetails || !questionDetails.options) return;
      
      // Get the options for this question
      const questionOptions = questionDetails.options || [];
      const selectedOptionId = parseInt(answers[question.id]);
      
      // Find if the selected answer is correct
      const selectedOption = questionOptions.find(opt => opt.id === selectedOptionId);
      
      if (selectedOption?.isCorrect) {
        correctAnswers += 1;
        earnedPoints += questionMarks;
      } else {
        incorrectAnswers += 1;
        // Apply negative marking proportional to question marks
        if (test?.negativeMarking && test.negativeMarking > 0) {
          const negativeMarkForQuestion = test.negativeMarking * questionMarks;
          earnedPoints -= negativeMarkForQuestion;
        }
      }
    });
    
    // Calculate percentage based on positive score against total marks
    // For percentage calculation, we use max(0, earnedPoints) to avoid negative percentages
    const positiveScore = Math.max(0, earnedPoints);
    const percentage = (positiveScore / (test?.totalMarks || 1)) * 100;
    
    // Format to 2 decimal places
    const formattedScore = earnedPoints.toFixed(2);
    
    return {
      score: earnedPoints, // Keep the original score (can be negative)
      total: test?.totalMarks || 0,
      percentage: Math.round(percentage),
      correctAnswers,
      incorrectAnswers,
      unansweredCount,
      displayScore: formattedScore // Store formatted score for display
    };
  };
  
  if (testLoading || questionsLoading || (currentQuestionId && detailsLoading)) {
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
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  // Display test completion screen
  if (testCompleted) {
    const scoreDetails = calculateScore();
    
    if (showingReport) {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto mb-6">
              <CardHeader className="text-center bg-primary/5 rounded-t-lg">
                <CardTitle className="text-2xl font-bold">Test Report: {test.title}</CardTitle>
                <div className="mt-2 text-muted-foreground">
                  See your performance and review your answers
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-primary-50 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Your Score</h3>
                      <div className="text-2xl font-bold text-primary">{scoreDetails.displayScore} / {scoreDetails.total}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary-50 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Percentage</h3>
                      <div className="text-2xl font-bold text-primary">{scoreDetails.percentage}%</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary-50 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Correct Answers</h3>
                      <div className="text-2xl font-bold text-primary">{scoreDetails.correctAnswers} / {questions.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary-50 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Result</h3>
                      <div className={`text-2xl font-bold ${parseFloat(scoreDetails.displayScore) >= test.passingMarks ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(scoreDetails.displayScore) >= test.passingMarks ? 'PASS' : 'FAIL'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h2 className="text-xl font-bold mb-4">Question Analysis</h2>
                
                {loadingReport ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
                    <p className="ml-3 text-muted-foreground">Loading detailed report...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((question, index) => {
                      const questionDetails = allQuestionDetails[question.id];
                      const selectedOptionId = answers[question.id] ? parseInt(answers[question.id]) : null;
                      const selectedOption = questionDetails?.options?.find(o => o.id === selectedOptionId);
                      const isCorrect = selectedOption?.isCorrect || false;
                      
                      return (
                        <Card key={question.id} className="overflow-hidden">
                          <CardHeader className={`py-3 px-4 ${answers[question.id] ? 
                              (isCorrect 
                                ? 'bg-green-50 border-b border-green-200' 
                                : 'bg-red-50 border-b border-red-200')
                              : 'bg-yellow-50 border-b border-yellow-200'}`}>
                            <div className="flex justify-between items-center">
                              <h3 className="text-sm font-medium">
                                Question {index + 1} {answers[question.id] ? 
                                  (isCorrect 
                                    ? '✓' 
                                    : '✗')
                                  : '(Unanswered)'}
                              </h3>
                              <span className="text-xs bg-background px-2 py-1 rounded font-medium">
                                {question.marks} marks
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="mb-4">{question.questionText}</p>
                            
                            {questionDetails?.options ? (
                              <div className="space-y-2 mb-4">
                                {questionDetails.options.map(option => (
                                  <div key={option.id} className={`p-3 rounded-md border ${
                                    selectedOptionId === option.id
                                      ? (option.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300')
                                      : option.isCorrect ? 'bg-green-50 border-green-300' : 'border-muted'
                                  }`}>
                                    <div className="flex items-start">
                                      <div className="flex-grow">
                                        {option.optionText}
                                      </div>
                                      <div>
                                        {selectedOptionId === option.id && (
                                          <span className="text-sm font-medium ml-2">
                                            {option.isCorrect ? '(Your answer - Correct)' : '(Your answer - Incorrect)'}
                                          </span>
                                        )}
                                        {option.isCorrect && selectedOptionId !== option.id && (
                                          <span className="text-sm font-medium text-green-600 ml-2">(Correct answer)</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 text-center text-muted-foreground border rounded-md">
                                Options not available
                              </div>
                            )}
                            
                            {questionDetails?.explanation && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                                <p className="text-sm text-muted-foreground">{questionDetails.explanation.explanationText}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setShowingReport(false)}>
                Back to Summary
              </Button>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
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
              <p className="text-center text-muted-foreground mb-6">
                Your responses have been recorded. You can view your performance report or exit this page.
              </p>
              
              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Your Score</span>
                  <span className="font-bold">{scoreDetails.displayScore} / {scoreDetails.total}</span>
                </div>
                <Progress value={scoreDetails.percentage} className="h-2 mb-2" />
                <div className="text-right text-sm text-muted-foreground">
                  {scoreDetails.percentage}% • {scoreDetails.correctAnswers} of {questions.length} correct
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 text-sm">
                  <div className="flex justify-between bg-green-50 p-2 rounded">
                    <span>Correct Answers:</span>
                    <span className="font-medium">{scoreDetails.correctAnswers}</span>
                  </div>
                  
                  <div className="flex justify-between bg-red-50 p-2 rounded">
                    <span>Incorrect Answers:</span>
                    <span className="font-medium">{scoreDetails.incorrectAnswers}</span>
                  </div>
                  
                  <div className="flex justify-between bg-yellow-50 p-2 rounded">
                    <span>Unanswered:</span>
                    <span className="font-medium">{scoreDetails.unansweredCount}</span>
                  </div>
                </div>
                
                {test?.negativeMarking && test.negativeMarking > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <span className="font-medium">Note:</span> Negative marking of {test.negativeMarking} × question marks has been applied for each incorrect answer.
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <Button className="min-w-[200px]" onClick={() => setShowingReport(true)}>
                  View Detailed Report
                </Button>
                <Button variant="outline" className="min-w-[200px]" onClick={() => navigate('/')}>
                  Return Home
                </Button>
                <Button variant="ghost" className="min-w-[200px]" onClick={() => navigate('/practice-tests')}>
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
                    {/* Use the detailed question data with options when available */}
                    {currentQuestionDetails && currentQuestionDetails.options && currentQuestionDetails.options.length > 0 ? (
                      currentQuestionDetails.options.map((option: Option) => (
                        <div key={option.id} className="flex items-start space-x-2 rounded-md border border-muted p-3">
                          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                            {option.optionText}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading options...
                      </div>
                    )}
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
                    {questions.map((question: Question, index: number) => (
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
                  
                  {test?.negativeMarking && test.negativeMarking > 0 && (
                    <>
                      <div className="font-medium">Negative Marking:</div>
                      <div>{test.negativeMarking} × question marks</div>
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