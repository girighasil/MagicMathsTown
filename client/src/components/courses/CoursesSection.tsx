import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CourseCard from "./CourseCard";
import type { Course } from "@/types";
import { useExamCategories } from "@/hooks/use-site-config";

export default function CoursesSection() {
  const { examCategories } = useExamCategories();
  const defaultCategory = examCategories[0] || "All Exams";
  
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  
  const { data: courses, error, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses', activeCategory],
    staleTime: 60000
  });

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <section id="courses" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-bold text-3xl text-gray-800 mb-3">Our Specialized Courses</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive preparation for all major competitive exams with specialized mathematics modules.
          </p>
        </motion.div>
        
        {/* Mobile filter buttons (scrollable) */}
        <div className="flex overflow-x-auto pb-2 md:hidden">
          <div className="flex space-x-2">
            {examCategories.map((category: string, index: number) => (
              <button
                key={index}
                className={`whitespace-nowrap px-4 py-2 rounded font-medium ${
                  activeCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Desktop filter buttons */}
        <div className="hidden md:flex justify-center mb-8 space-x-3">
          {examCategories.map((category: string, index: number) => (
            <Button
              key={index}
              variant={activeCategory === category ? "default" : "secondary"}
              className={activeCategory === category ? "bg-primary" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            Failed to load courses. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses?.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Button variant="link" className="text-primary font-semibold hover:underline">
            View All Courses <span className="ml-1">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
