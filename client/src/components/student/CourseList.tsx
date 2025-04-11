import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, BookOpen, ArrowRight, Loader2 } from "lucide-react";

// Define the Course interface
interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  duration: string;
  category?: string;
  categories?: string[];
  level: string;
  popular: boolean;
  image?: string;
  syllabus?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
}

// A component to display individual course cards
const CourseCard = ({ course }: { course: Course }) => {
  const [, navigate] = useLocation();
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-md font-semibold text-primary truncate">
            {course.title}
          </CardTitle>
          {course.popular && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
              Popular
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
          {course.level && (
            <div className="flex items-center">
              <BookOpen className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{course.level}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
          {course.discountPrice && course.discountPrice < course.price ? (
            <>
              <span className="text-sm font-bold">₹{course.discountPrice}</span>
              <span className="text-xs text-muted-foreground line-through">₹{course.price}</span>
            </>
          ) : (
            <span className="text-sm font-bold">₹{course.price}</span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-primary p-0 h-8"
          onClick={() => navigate(`/courses`)}>
          View <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function CourseList() {
  const [, navigate] = useLocation();
  
  // Fetch all courses
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Failed to load courses. Please try again later.</p>
      </div>
    );
  }
  
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">No courses available at the moment.</p>
        <Button
          className="mt-4"
          onClick={() => navigate("/courses")}
        >
          Browse Courses
        </Button>
      </div>
    );
  }
  
  // Get only the popular courses or first few courses
  const displayedCourses = courses
    .filter(course => course.popular)
    .slice(0, 3);
  
  // If no popular courses, just take the first few
  const coursesToShow = displayedCourses.length > 0 
    ? displayedCourses 
    : courses.slice(0, 3);
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coursesToShow.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
      {courses.length > 3 && (
        <div className="text-right mt-4">
          <Button
            variant="link" 
            className="text-primary px-0"
            onClick={() => navigate("/courses")}
          >
            View All Courses <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}