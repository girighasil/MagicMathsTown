import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { EXAM_CATEGORIES } from '@/lib/constants';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataTable } from '@/components/admin/DataTable';
import { Course } from '@/types';
import { CourseForm } from '@/components/admin/CourseForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CoursesManagement() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [examCategories, setExamCategories] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  const { data: config } = useQuery<Record<string, any>>({
    queryKey: ['/api/site-config'],
  });
  
  useEffect(() => {
    if (config) {
      setExamCategories(config.examCategories || EXAM_CATEGORIES);
    }
  }, [config]);
  
  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: async (data: Omit<Course, 'id' | 'createdAt'>) => {
      const response = await apiRequest('POST', '/api/admin/courses', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Course created',
        description: 'The course has been created successfully.',
      });
      refetchCourses();
      setIsEditDialogOpen(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: 'Error creating course',
        description: error.message || 'An error occurred while creating the course.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  const updateCourseMutation = useMutation({
    mutationFn: async (data: { id: number; courseData: Partial<Course> }) => {
      const response = await apiRequest('PUT', `/api/admin/courses/${data.id}`, data.courseData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Course updated',
        description: 'The course has been updated successfully.',
      });
      refetchCourses();
      setIsEditDialogOpen(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: 'Error updating course',
        description: error.message || 'An error occurred while updating the course.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Course deleted',
        description: 'The course has been deleted successfully.',
      });
      refetchCourses();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting course',
        description: error.message || 'An error occurred while deleting the course.',
        variant: 'destructive',
      });
    }
  });
  
  // Exam category operations
  const addExamCategory = () => {
    setExamCategories([...examCategories, '']);
  };
  
  const updateExamCategory = (index: number, value: string) => {
    const updatedCategories = [...examCategories];
    updatedCategories[index] = value;
    setExamCategories(updatedCategories);
  };
  
  const removeExamCategory = (index: number) => {
    setExamCategories(examCategories.filter((_, i) => i !== index));
  };
  
  const saveExamCategories = async () => {
    setSaving(true);
    try {
      await apiRequest('PUT', `/api/admin/site-config/examCategories`, {
        value: examCategories
      });
      
      toast({
        title: 'Exam categories saved',
        description: 'Exam categories have been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/site-config'] });
    } catch (error) {
      toast({
        title: 'Error saving exam categories',
        description: 'An error occurred while saving exam categories.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Course form handlers
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsEditDialogOpen(true);
  };
  
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmitCourse = (courseData: any) => {
    setIsSubmitting(true);
    if (selectedCourse) {
      // Update existing course
      updateCourseMutation.mutate({
        id: selectedCourse.id,
        courseData
      });
    } else {
      // Create new course
      createCourseMutation.mutate(courseData);
    }
  };
  
  const courseColumns = [
    { key: 'id', title: 'ID' },
    { key: 'title', title: 'Title' },
    { key: 'categories', title: 'Categories', render: (item: Course) => 
      Array.isArray(item.categories) 
        ? item.categories.join(', ') 
        : item.category || '-' 
    },
    { key: 'price', title: 'Price', render: (item: Course) => `₹${item.price}` },
    { key: 'popular', title: 'Popular', render: (item: Course) => item.popular ? 'Yes' : 'No' },
    { key: 'isLive', title: 'Live', render: (item: Course) => item.isLive ? 'Yes' : 'No' }
  ];

  return (
    <AdminLayout title="Courses Management">
      <Tabs defaultValue="list">
        <TabsList className="mb-6 flex flex-wrap gap-2">
          <TabsTrigger value="list">Course List</TabsTrigger>
          <TabsTrigger value="categories">Exam Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>Manage your educational courses</CardDescription>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable 
                  data={courses || []} 
                  columns={courseColumns}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  onAdd={handleAddCourse}
                  title="Courses" 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Exam Categories</CardTitle>
              <CardDescription>Customize the exam categories displayed on the courses page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {examCategories.map((category, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={category}
                    onChange={(e) => updateExamCategory(index, e.target.value)}
                    placeholder="Category Name"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExamCategory(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="mt-2" onClick={addExamCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exam Category
              </Button>
            </CardContent>
            <CardFooter>
              <Button onClick={saveExamCategories} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Exam Categories
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit/Add Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <CourseForm 
            course={selectedCourse || undefined}
            onSubmit={handleSubmitCourse}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course "{selectedCourse?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedCourse && deleteCourseMutation.mutate(selectedCourse.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCourseMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}