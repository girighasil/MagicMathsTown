import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SimpleDataTable } from "@/components/admin/SimpleDataTable";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Plus, FileUp, ExternalLink, Edit, Trash2, PlusCircle, MinusCircle, Check, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const questionSchema = z.object({
  questionText: z.string().min(2, { message: "Question text must be at least 2 characters" }),
  marks: z.coerce.number().min(1, { message: "Marks is required" }).default(1),
  questionType: z.string().default("mcq"),
  imageUrl: z.string().optional(),
  options: z.array(
    z.object({
      optionText: z.string().min(1, { message: "Option text is required" }),
      isCorrect: z.boolean().default(false),
    })
  ).min(2, { message: "At least 2 options are required" }),
  explanation: z.object({
    explanationText: z.string().min(1, { message: "Explanation text is required" }),
    imageUrl: z.string().optional(),
  }).optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

function TestQuestions() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const { data: test, isLoading: isLoadingTest } = useQuery({
    queryKey: ['/api/tests', parseInt(id)],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test details');
      }
      return response.json();
    },
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['/api/tests', parseInt(id), 'questions'],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${id}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return response.json();
    },
  });

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
      marks: 1,
      questionType: "mcq",
      imageUrl: "",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      explanation: {
        explanationText: "",
        imageUrl: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      // First create the question
      const questionData = {
        testId: parseInt(id),
        questionText: data.questionText,
        marks: data.marks,
        questionType: data.questionType,
        imageUrl: data.imageUrl || null,
      };
      
      const questionResponse = await apiRequest("POST", "/api/admin/questions", questionData);
      const question = await questionResponse.json();
      
      // Then create options
      const optionPromises = data.options.map(option => 
        apiRequest("POST", "/api/admin/options", {
          questionId: question.question.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        })
      );
      
      await Promise.all(optionPromises);
      
      // Finally create explanation if provided
      if (data.explanation && data.explanation.explanationText) {
        await apiRequest("POST", "/api/admin/explanations", {
          questionId: question.question.id,
          explanationText: data.explanation.explanationText,
          imageUrl: data.explanation.imageUrl || null,
        });
      }
      
      return question;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Question created successfully",
      });
      setIsAddModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/tests', parseInt(id), 'questions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create question: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/admin/questions/${selectedQuestion.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedQuestion(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tests', parseInt(id), 'questions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete question: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const fileUploadMutation = useMutation({
    mutationFn: async (fileUrl: string) => {
      return await apiRequest("POST", `/api/admin/tests/${id}/upload`, { fileUrl });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File URL saved successfully",
      });
      setUploadSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/tests', parseInt(id)] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save file URL: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuestionFormValues) => {
    createQuestionMutation.mutate(data);
  };

  const handleFileUpload = () => {
    if (!fileUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file URL",
        variant: "destructive",
      });
      return;
    }
    fileUploadMutation.mutate(fileUrl);
  };

  const openAddModal = () => {
    form.reset();
    setSelectedQuestion(null);
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (question: any) => {
    setSelectedQuestion(question);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteQuestionMutation.mutate();
  };

  const addOption = () => {
    append({ optionText: "", isCorrect: false });
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    } else {
      toast({
        title: "Error",
        description: "A question must have at least 2 options",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTest) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const columns = [
    {
      key: "questionText",
      title: "Question",
      render: (row: any) => {
        const questionText = row.questionText;
        return (
          <div className="max-w-md truncate" title={questionText}>
            {questionText}
          </div>
        );
      },
    },
    {
      key: "marks",
      title: "Marks",
      render: (row: any) => (
        <Badge variant="outline">{row.marks}</Badge>
      ),
    },
    {
      key: "questionType",
      title: "Type",
      render: (row: any) => (
        <Badge>{row.questionType.toUpperCase()}</Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => openDeleteModal(row)}
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Question Management">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Test: {test?.title}</h1>
            <p className="text-muted-foreground">{test?.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/admin/test-series/${test?.testSeriesId}`)}>
              Back to Test Series
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="file-upload">File Upload</TabsTrigger>
            <TabsTrigger value="settings">Test Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            {isLoadingQuestions ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    {questions?.length 
                      ? `This test has ${questions.length} questions with a total of ${test?.totalMarks || 0} marks.`
                      : "This test has no questions yet. Add questions using the button above."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleDataTable
                    columns={columns}
                    data={questions || []}
                    searchField="questionText"
                    searchPlaceholder="Search questions..."
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="file-upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Test Paper</CardTitle>
                <CardDescription>
                  Upload a PDF or image file of the test paper instead of creating questions manually.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    placeholder="Enter URL to test paper file"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a URL to a publicly accessible PDF or image file.
                  </p>
                </div>
                
                {test?.fileUrl && (
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="font-medium">Current File:</h3>
                    <a 
                      href={test.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center mt-1"
                    >
                      {test.fileUrl}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
                
                {uploadSuccess && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    File URL saved successfully!
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={fileUploadMutation.isPending}
                >
                  {fileUploadMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <FileUp className="mr-2 h-4 w-4" />
                  Save File URL
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Test Settings</CardTitle>
                <CardDescription>
                  View and manage test settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Duration</h3>
                    <p>{test?.duration} minutes</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                    <p>{test?.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Total Marks</h3>
                    <p>{test?.totalMarks}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Passing Marks</h3>
                    <p>{test?.passingMarks}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Negative Marking</h3>
                    <p>{test?.negativeMarking || 0}</p>
                  </div>
                </div>
                
                {test?.instructions && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Instructions</h3>
                      <p className="whitespace-pre-line">{test.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/admin/test-series/${test?.testSeriesId}`)}
                >
                  Back to Test Series
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Question Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter the question text" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="questionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL to question image" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Options</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={fields.length >= 6}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <div className="flex-grow space-y-2">
                        <FormField
                          control={form.control}
                          name={`options.${index}.optionText`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={`Option ${index + 1}`} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <FormField
                          control={form.control}
                          name={`options.${index}.isCorrect`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">Correct</FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          disabled={fields.length <= 2}
                        >
                          <MinusCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Explanation (Optional)</h3>
                  
                  <FormField
                    control={form.control}
                    name="explanation.explanationText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation Text</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Provide an explanation for the correct answer" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="explanation.imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL to explanation image" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createQuestionMutation.isPending}
                  >
                    {createQuestionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Question
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteQuestionMutation.isPending}
              >
                {deleteQuestionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default TestQuestions;