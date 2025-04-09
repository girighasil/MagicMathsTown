import { motion } from "framer-motion";
import { Star, StarHalf } from "lucide-react";
import type { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-5 w-5 fill-amber-400 text-amber-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="h-5 w-5 fill-amber-400 text-amber-400" />
      );
    }
    
    return stars;
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="text-amber-400 flex">
          {renderStars(testimonial.rating)}
        </div>
        <span className="ml-2 text-gray-600">{testimonial.rating}</span>
      </div>
      
      <p className="text-gray-700 mb-6 italic">"{testimonial.testimonial}"</p>
      
      <div className="flex items-center">
        {testimonial.imageUrl && (
          <img 
            src={testimonial.imageUrl} 
            alt={testimonial.name} 
            className="w-12 h-12 rounded-full mr-3 object-cover" 
          />
        )}
        <div>
          <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
          {(testimonial.examName || testimonial.rank) && (
            <p className="text-sm text-gray-600">
              {testimonial.examName}
              {testimonial.rank && `, ${testimonial.rank}`}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
