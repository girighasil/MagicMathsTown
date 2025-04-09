import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section id="home" className="bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
              Ace Your Math Competitive Exams
            </h1>
            <p className="text-lg mb-8 text-gray-100">
              Personalized coaching, expert doubt resolution, and comprehensive practice tests for JEE, NEET, NDA, and more.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                <a href="#courses">Explore Courses</a>
              </Button>
              <Button size="lg" className="bg-[#D97706] hover:bg-[#B45309] text-white">
                Try Free Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Students studying mathematics" 
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
