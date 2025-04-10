import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SimpleDataTable } from "@/components/admin/SimpleDataTable";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const testSeriesSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  testCount: z.coerce.number().min(1, { message: "Test count is required" }),
  price: z.coerce.number().min(0, { message: "Price cannot be negative" }),
  features: z.array(z.string().min(1, { message: "Feature cannot be empty" }))
    .min(1, { message: "At least one feature is required" }),
});

type TestSeriesFormValues = z.infer<typeof testSeriesSchema>;

function TestSeriesManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTestSeries, setSelectedTestSeries] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: testSeries, isLoading } = useQuery({
    queryKey: ['/api/test-series'],
    queryFn: async () => {
      const response = await fetch('/api/test-series');
      if (!response.ok) {
        throw new Error('Failed to fetch test series');
      }
      return response.json();
    },
  });

  const form = useForm<TestSeriesFormValues>({
    resolver: zodResolver(testSeriesSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      testCount: 0,
      price: 0,
      features: ["Free study materials"],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const createTestSeriesMutation = useMutation({
    mutationFn: async (data: TestSeriesFormValues) => {
      return await apiRequest("POST", "/api/admin/test-series", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test series created successfully",
      });
      setIsAddModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/test-series'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create test series: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTestSeriesMutation = useMutation({
    mutationFn: async (data: TestSeriesFormValues) => {
      return await apiRequest("PUT", `/api/admin/test-series/${selectedTestSeries.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test series updated successfully",
      });
      setIsAddModalOpen(false);
      setSelectedTestSeries(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/test-series'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update test series: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTestSeriesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/admin/test-series/${selectedTestSeries.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test series deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedTestSeries(null);
      queryClient.invalidateQueries({ queryKey: ['/api/test-series'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete test series: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TestSeriesFormValues) => {
    if (selectedTestSeries) {
      updateTestSeriesMutation.mutate(data);
    } else {
      createTestSeriesMutation.mutate(data);
    }
  };

  const openAddModal = () => {
    form.reset();
    setSelectedTestSeries(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (testSeries: any) => {
    setSelectedTestSeries(testSeries);
    form.reset({
      title: testSeries.title,
      description: testSeries.description,
      category: testSeries.category,
      testCount: testSeries.testCount,
      price: testSeries.price,
      features: testSeries.features,
    });
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (testSeries: any) => {
    setSelectedTestSeries(testSeries);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTestSeriesMutation.mutate();
  };

  const addFeature = () => {
    append("New feature");
  };

  const removeFeature = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: "Error",
        description: "At least one feature is required",
        variant: "destructive",
      });
    }
  };

  const navigateToTests = (testSeries: any) => {
    navigate(`/admin/test-series/${testSeries.id}`);
  };

  const columns = [
    {
      key: "title",
      title: "Title",
      render: (row: any) => (
        <div className="max-w-sm truncate" title={row.title}>
          {row.title}
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
    },
    {
      key: "testCount",
      title: "Tests",
    },
    {
      key: "price",
      title: "Price",
      render: (row: any) => (
        <span>₹{row.price}</span>
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
            onClick={() => navigateToTests(row)}
            title="Manage Tests"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => openEditModal(row)}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => openDeleteModal(row)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Test Series Management">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Test Series Management</h1>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Test Series
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <SimpleDataTable
                columns={columns}
                data={testSeries || []}
                searchField="title"
                searchPlaceholder="Search test series..."
              />
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTestSeries ? "Edit Test Series" : "Add New Test Series"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Test series title" {...field} />
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
                        <Textarea placeholder="Test series description" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., JEE Main/Advanced" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="testCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Tests</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Features</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      Add Feature
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`features.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input placeholder={`Feature ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTestSeriesMutation.isPending || updateTestSeriesMutation.isPending}
                  >
                    {(createTestSeriesMutation.isPending || updateTestSeriesMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {selectedTestSeries ? "Update" : "Create"}
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
              Are you sure you want to delete the test series "{selectedTestSeries?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteTestSeriesMutation.isPending}
              >
                {deleteTestSeriesMutation.isPending && (
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

export default TestSeriesManagement;