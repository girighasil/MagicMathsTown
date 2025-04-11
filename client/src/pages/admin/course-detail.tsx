import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { type Course } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import CourseForm from '@/components/admin/CourseForm';
import CourseVideosManagement from '@/components/admin/CourseVideosManagement';
import { ArrowLeft, BookOpen, FileVideo, Info } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id);
  const [activeTab, setActiveTab] = useState<string>('details');
  
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });
  
  if (isLoading || !course) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Course: {course.title}</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="details">
            <Info className="h-4 w-4 mr-2" />
            Course Details
          </TabsTrigger>
          <TabsTrigger value="videos">
            <FileVideo className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Update the course details and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <CourseForm course={course} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Course Videos</CardTitle>
                <CardDescription>Manage videos for this course</CardDescription>
              </CardHeader>
              <CardContent>
                <CourseVideosManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}