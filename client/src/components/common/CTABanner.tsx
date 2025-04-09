import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CTABanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.h2 
          className="font-bold text-3xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ready to Excel in Mathematics?
        </motion.h2>
        
        <motion.p 
          className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Join thousands of students who have transformed their mathematical abilities and achieved their dream scores with Maths Magic Town.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
            <a href="#courses">Explore Courses</a>
          </Button>
          <Button size="lg" className="bg-[#D97706] hover:bg-[#B45309] text-white">
            Register Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
