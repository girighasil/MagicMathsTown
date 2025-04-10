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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Plus, FileUp, ExternalLink, Edit, Trash2, Link as LinkIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const testSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  duration: z.coerce.number().min(1, { message: "Duration is required" }),
  totalMarks: z.coerce.number().min(1, { message: "Total marks is required" }),
  passingMarks: z.coerce.number().min(1, { message: "Passing marks is required" }),
  negativeMarking: z.coerce.number().min(0, { message: "Negative marking cannot be negative" }),
  instructions: z.string().optional(),
  fileUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type TestFormValues = z.infer<typeof testSchema>;

// Link Test Button Component
function LinkTestButton({ testId, testSeriesId }: { testId: number, testSeriesId: number }) {
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);

  const linkTestMutation = useMutation({
    mutationFn: async () => {
      setIsLinking(true);
      return await apiRequest(
        "POST", 
        `/api/admin/test-series/${testSeriesId}/link-test`, 
        { testId }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test linked to test series successfully",
      });
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-series', testSeriesId, 'tests'] });
      setIsLinking(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to link test: ${error.message}`,
        variant: "destructive",
      });
      setIsLinking(false);
    },
  });

  const handleLinkTest = () => {
    linkTestMutation.mutate();
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleLinkTest}
      disabled={isLinking}
    >
      {isLinking ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LinkIcon className="h-4 w-4 mr-2" />
      )}
      Link to Series
    </Button>
  );
}

function TestDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: testSeries, isLoading: isLoadingTestSeries } = useQuery({
    queryKey: ['/api/test-series', parseInt(id)],
    queryFn: async () => {
      const response = await fetch(`/api/test-series/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test series');
      }
      return response.json();
    },
  });

  const { data: seriesTests, isLoading: isLoadingSeriesTests } = useQuery({
    queryKey: ['/api/test-series', parseInt(id), 'tests'],
    queryFn: async () => {
      const response = await fetch(`/api/test-series/${id}/tests`);
      if (!response.ok) {
        throw new Error('Failed to fetch tests for this series');
      }
      return response.json();
    },
  });
  
  // Get all available tests to allow linking tests to this test series
  const { data: allTests, isLoading: isLoadingAllTests } = useQuery({
    queryKey: ['/api/tests'],
    queryFn: async () => {
      const response = await fetch('/api/tests');
      if (!response.ok) {
        throw new Error('Failed to fetch all tests');
      }
      return response.json();
    },
  });

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      negativeMarking: 0.25,
      instructions: "",
      fileUrl: "",
      isActive: true,
    },
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: TestFormValues) => {
      const payload = {
        ...data,
        testSeriesId: parseInt(id),
        // Convert negativeMarking to string as expected by the schema
        negativeMarking: data.negativeMarking.toString(),
      };
      return await apiRequest("POST", "/api/admin/tests", payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test created successfully",
      });
      setIsAddModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/test-series', parseInt(id), 'tests'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create test: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: async (data: TestFormValues) => {
      const payload = {
        ...data,
        // Convert negativeMarking to string as expected by the schema
        negativeMarking: data.negativeMarking.toString(),
      };
      return await apiRequest("PUT", `/api/admin/tests/${selectedTest.id}`, payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test updated successfully",
      });
      setIsAddModalOpen(false);
      setSelectedTest(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/test-series', parseInt(id), 'tests'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update test: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/admin/tests/${selectedTest.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedTest(null);
      queryClient.invalidateQueries({ queryKey: ['/api/test-series', parseInt(id), 'tests'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete test: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TestFormValues) => {
    if (selectedTest) {
      updateTestMutation.mutate(data);
    } else {
      createTestMutation.mutate(data);
    }
  };

  const openAddModal = () => {
    form.reset();
    setSelectedTest(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (test: any) => {
    setSelectedTest(test);
    form.reset({
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      negativeMarking: test.negativeMarking,
      instructions: test.instructions || "",
      fileUrl: test.fileUrl || "",
      isActive: test.isActive,
    });
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (test: any) => {
    setSelectedTest(test);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTestMutation.mutate();
  };

  const navigateToQuestions = (test: any) => {
    navigate(`/admin/tests/${test.id}/questions`);
  };

  if (isLoadingTestSeries) {
    return (
      <AdminLayout title="Test Management">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const columns = [
    {
      key: "title",
      title: "Title",
    },
    {
      key: "duration",
      title: "Duration (mins)",
    },
    {
      key: "totalMarks",
      title: "Total Marks",
    },
    {
      key: "passingMarks",
      title: "Passing Marks",
    },
    {
      key: "negativeMarking",
      title: "Negative Marking",
      render: (row: any) => (
        <span>{row.negativeMarking || 0}</span>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (row: any) => (
        <span className={row.isActive ? "text-green-600" : "text-red-600"}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
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
            onClick={() => navigateToQuestions(row)}
            title="Manage Questions"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => openEditModal(row)}
            title="Edit Test"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => openDeleteModal(row)}
            title="Delete Test"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Test Management">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Test Series: {testSeries?.title}</h1>
            <p className="text-muted-foreground">{testSeries?.description}</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Test
          </Button>
        </div>

        {isLoadingSeriesTests || isLoadingAllTests ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Tests in this Series</CardTitle>
                <CardDescription>
                  Manage tests for this test series. Click on a test to view and manage its questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {seriesTests && seriesTests.length > 0 ? (
                  <SimpleDataTable
                    columns={columns}
                    data={seriesTests}
                    searchField="title"
                    searchPlaceholder="Search tests..."
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tests found in this series. Add a new test or link an existing test below.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Link Existing Tests</CardTitle>
                <CardDescription>
                  You can link existing tests to this test series.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allTests && allTests.filter(test => !test.testSeriesId || test.testSeriesId !== parseInt(id)).length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Total Marks</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allTests
                          .filter(test => !test.testSeriesId || test.testSeriesId !== parseInt(id))
                          .map((test) => (
                            <TableRow key={test.id}>
                              <TableCell>{test.title}</TableCell>
                              <TableCell>{test.duration} mins</TableCell>
                              <TableCell>{test.totalMarks}</TableCell>
                              <TableCell>
                                <span className={test.isActive ? "text-green-600" : "text-red-600"}>
                                  {test.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <LinkTestButton testId={test.id} testSeriesId={parseInt(id)} />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No unlinked tests available. Create new tests to link to this series.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Add/Edit Test Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTest ? "Edit Test" : "Add New Test"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="basic">
                  <TabsList className="mb-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Test title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Test description" {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-2 space-y-0 mt-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormLabel>Active</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="totalMarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Marks</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="passingMarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passing Marks</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="negativeMarking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Negative Marking</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Test instructions" {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="URL to test file" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTestMutation.isPending || updateTestMutation.isPending}
                  >
                    {(createTestMutation.isPending || updateTestMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {selectedTest ? "Update Test" : "Create Test"}
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
              Are you sure you want to delete the test "{selectedTest?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteTestMutation.isPending}
              >
                {deleteTestMutation.isPending && (
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

export default TestDetails;