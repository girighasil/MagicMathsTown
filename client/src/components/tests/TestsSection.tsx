import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import TestCard from "./TestCard";
import SampleQuestion from "./SampleQuestion";
import type { TestSeries } from "@/types";

export default function TestsSection() {
  const { data: testSeries, error, isLoading } = useQuery<TestSeries[]>({
    queryKey: ['/api/test-series'],
    staleTime: 60000
  });

  return (
    <section id="practice-tests" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-bold text-3xl text-gray-800 mb-3">Practice Tests & Mock Exams</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Perfect your skills with our comprehensive test series designed to mirror real exam patterns and difficulty levels.
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            Failed to load test series. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testSeries?.map((test, index) => (
              <TestCard key={test.id} test={test} index={index} />
            ))}
          </div>
        )}
        
        {/* Sample Question Preview */}
        <SampleQuestion />
        
        <div className="text-center mt-8">
          <Button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg">
            View All Test Series
          </Button>
        </div>
      </div>
    </section>
  );
}
