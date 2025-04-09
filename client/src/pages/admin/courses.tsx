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
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/admin/DataTable';
import { Course } from '@/types';

export default function CoursesManagement() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [examCategories, setExamCategories] = useState<string[]>([]);
  
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
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
                  onEdit={(course) => {
                    // Handle edit course
                    console.log("Edit course:", course);
                  }}
                  onDelete={(course) => {
                    // Handle delete course
                    console.log("Delete course:", course);
                  }}
                  onAdd={() => {
                    // Handle add course
                    console.log("Add new course");
                  }}
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
    </AdminLayout>
  );
}