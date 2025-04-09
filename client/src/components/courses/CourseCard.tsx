import { motion } from "framer-motion";
import { Clock, BookOpen } from "lucide-react";
import type { Course } from "@/types";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: Course;
  index: number;
}

export default function CourseCard({ course, index }: CourseCardProps) {
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform duration-300 hover:transform hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.popular && (
          <span className="absolute top-4 right-4 bg-[#D97706] text-white text-sm font-semibold py-1 px-2 rounded">
            Most Popular
          </span>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xl">{course.title}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            course.isLive 
              ? "bg-green-100 text-[#10B981]" 
              : "bg-blue-100 text-primary"
          }`}>
            {course.isLive ? "Live Classes" : "Recorded"}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Clock className="h-4 w-4 mr-2" />
          <span>Duration: {course.duration}</span>
          <span className="mx-2">•</span>
          <BookOpen className="h-4 w-4 mr-2" />
          <span>{course.modules} Modules</span>
        </div>
        
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            {course.discountPrice ? (
              <>
                <span className="text-gray-400 line-through">₹{course.price.toLocaleString()}</span>
                <span className="text-lg font-bold text-primary ml-2">₹{course.discountPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">₹{course.price.toLocaleString()}</span>
            )}
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Enroll Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
