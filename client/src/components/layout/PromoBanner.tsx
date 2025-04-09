import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // Announcements data
  const announcements = [
    "🎓 Summer Batch 2025: Registrations Open Now! 15% Early Bird Discount",
    "📚 New JEE 2025 Crash Course Launching Next Week",
    "🏆 Congratulations to our students for Top 100 JEE Advanced ranks",
    "🔥 Special Offer: Get free doubt classes with any course purchase",
  ];

  // Set up auto rotation between announcements
  const [currentIndex, setCurrentIndex] = useState(0);

  // Close the banner
  const closeBanner = () => {
    setIsVisible(false);
  };

  // Navigate to next announcement
  const nextAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
  };

  // Navigate to previous announcement
  const prevAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length);
  };

  // Auto rotate announcements
  useEffect(() => {
    const interval = setInterval(() => {
      nextAnnouncement();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(white,_transparent_60%)] bg-left"></div>
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-center">
          <button
            onClick={prevAnnouncement}
            className="hidden sm:flex p-1 rounded-full hover:bg-white/20 transition-colors mr-3 z-10"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="overflow-hidden w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center font-medium text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <div className="relative sm:static">
                  <motion.span
                    className="inline-block sm:static"
                    animate={{
                      x: [-20, 0],
                    }}
                    transition={{
                      x: {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 8,
                        ease: "linear",
                      },
                    }}
                  >
                    {announcements[currentIndex]}
                  </motion.span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button
            onClick={nextAnnouncement}
            className="hidden sm:flex p-1 rounded-full hover:bg-white/20 transition-colors mx-3 z-10"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={closeBanner}
            className="p-1 rounded-full hover:bg-white/20 transition-colors z-10"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center space-x-1 mt-1">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 transition-all ${
                index === currentIndex 
                  ? "w-4 bg-white" 
                  : "w-2 bg-white/40 hover:bg-white/60"
              } rounded-full`}
              aria-label={`Announcement ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}