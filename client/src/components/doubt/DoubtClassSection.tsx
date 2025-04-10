import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import DoubtForm from "./DoubtForm";

export default function DoubtClassSection() {
  const features = [
    "Live one-on-one doubt resolution sessions",
    "Upload your questions and get detailed solutions",
    "Topic-wise expert teachers available",
    "24-hour turnaround time guaranteed"
  ];

  return (
    <section id="doubt-classes" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-bold text-3xl text-gray-800 mb-4">
              Get Your Math Doubts Resolved Instantly
            </h2>
            <p className="text-gray-600 mb-6">
              Our specialized doubt clearing sessions ensure you never get stuck on a problem. 
              Access expert teachers who provide step-by-step solutions to your mathematics queries.
            </p>

            <div className="mb-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Check className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <p className="text-gray-700">{feature}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Book a Doubt Session
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                How It Works
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-primary p-4 text-white">
                <h3 className="font-semibold text-xl">Book Free Demo</h3>
              </div>
              <DoubtForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}