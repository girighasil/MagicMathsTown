import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";
import type { Testimonial } from "@/types";

export default function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  const { data: testimonials, error, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    staleTime: 60000
  });

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    
    if (testimonialsRef.current) {
      const slideWidth = testimonialsRef.current.offsetWidth;
      testimonialsRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (!testimonials) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      
      if (testimonialsRef.current) {
        const slideWidth = testimonialsRef.current.offsetWidth;
        testimonialsRef.current.scrollTo({
          left: ((currentSlide + 1) % testimonials.length) * slideWidth,
          behavior: 'smooth'
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials, currentSlide]);

  // Update currentSlide on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (testimonialsRef.current) {
        const scrollLeft = testimonialsRef.current.scrollLeft;
        const slideWidth = testimonialsRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / slideWidth);
        
        if (newIndex !== currentSlide) {
          setCurrentSlide(newIndex);
        }
      }
    };
    
    const ref = testimonialsRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, [currentSlide]);

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-bold text-3xl text-gray-800 mb-3">Success Stories from Our Students</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our students who cracked their competitive exams with flying colors.
          </p>
        </motion.div>
        
        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              Failed to load testimonials. Please try again later.
            </div>
          ) : (
            <>
              <div 
                ref={testimonialsRef}
                className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {testimonials?.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4 snap-center"
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
              
              <div className="absolute left-0 right-0 bottom-0 flex justify-center space-x-2">
                {testimonials?.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      currentSlide === index ? "bg-primary" : "bg-gray-300"
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
