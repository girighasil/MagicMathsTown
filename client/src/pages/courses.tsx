import { useState, useEffect } from "react";
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
import { Loader2, Clock, Calendar, Users, BookOpen, ArrowRight } from "lucide-react";
import { NavigationIcons } from "@/components/common/NavigationIcons";

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
  
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary">
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
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          {course.level && (
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{course.level}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.enrollmentStartDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Starts: {new Date(course.enrollmentStartDate).toLocaleDateString()}</span>
            </div>
          )}
          {(course.category || (course.categories && course.categories.length > 0)) && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {course.category || (course.categories && course.categories[0])}
              </span>
            </div>
          )}
        </div>
        
        {course.syllabus && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Syllabus Highlights:</p>
            <p className="line-clamp-3">{course.syllabus}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center mt-auto">
        <div>
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">₹{course.discountPrice}</span>
              <span className="text-sm text-muted-foreground line-through">₹{course.price}</span>
            </div>
          ) : (
            <span className="text-xl font-bold">₹{course.price}</span>
          )}
        </div>
        <Button variant="outline" className="gap-1">
          Details <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function CoursesPage() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Fetch all courses
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Extract unique categories from courses
  const categories = courses
    ? ["All", ...new Set(courses.flatMap(course => {
        if (course.categories && course.categories.length > 0) {
          return course.categories;
        } else if (course.category) {
          return [course.category];
        }
        return [];
      }))]
    : ["All"];
  
  // Filter courses by category
  const filteredCourses = courses
    ? activeCategory === "All"
      ? courses
      : courses.filter(course => {
          if (course.categories && course.categories.includes(activeCategory)) {
            return true;
          }
          return course.category === activeCategory;
        })
    : [];
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center text-red-500">
          <p>Failed to load courses. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      <div className="mb-8">
        <NavigationIcons previousPath="/" previousLabel="Back to Home" />
      </div>
      
      {/* Header Section */}
      <div className="bg-primary/5 p-6 rounded-lg mb-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">Online Courses for Competitive Exams</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Comprehensive courses designed to help you excel in various competitive exams. Learn from expert faculty and access quality study materials.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="flex">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Structured Learning</h3>
                <p className="text-sm text-gray-600">
                  Step-by-step curriculum designed by exam experts to cover all important topics.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Expert Faculty</h3>
                <p className="text-sm text-gray-600">
                  Learn from experienced teachers who understand exam patterns and requirements.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="default" 
            className="w-full md:w-auto"
            onClick={() => navigate("/contact")}
          >
            Contact for More Information
          </Button>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browse By Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No courses found for this category.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setActiveCategory("All")}
          >
            View All Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
      
      {/* Additional Information */}
      <div className="mt-16 bg-secondary/10 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Why Choose Our Courses?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Comprehensive Material</h3>
            <p className="text-muted-foreground text-sm">
              Our course materials are regularly updated to reflect the latest exam patterns and syllabus changes.
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Practice Tests</h3>
            <p className="text-muted-foreground text-sm">
              Regular mock tests designed to simulate actual exam conditions and improve your performance.
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Doubt Resolution</h3>
            <p className="text-muted-foreground text-sm">
              Get your doubts cleared by our expert teachers through dedicated doubt resolution sessions.
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate('/test-series')}
          >
            Check Out Our Test Series
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}