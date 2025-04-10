import { motion } from "framer-motion";
import { Medal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { TestSeries } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface TestCardProps {
  test: TestSeries;
  index: number;
}

export default function TestCard({ test, index }: TestCardProps) {
  const [, navigate] = useLocation();
  
  // Fetch tests in this test series
  const { data: testsInSeries } = useQuery({
    queryKey: [`/api/test-series/${test.id}/tests`],
    enabled: !!test.id
  });
  
  const handleStartPracticing = () => {
    if (testsInSeries && testsInSeries.length > 0) {
      // Navigate to the first test in the series
      navigate(`/test/${testsInSeries[0].id}`);
    }
  };
  
  // Define badge color based on category or test count
  const getBadgeColor = (testCount: number, category: string) => {
    if (category === "JEE Main/Advanced") return "bg-blue-100 text-primary";
    if (testCount > 50) return "bg-green-100 text-[#10B981]";
    return "bg-amber-100 text-[#D97706]";
  };

  const badgeText = test.testCount > 1 ? `${test.testCount} Tests` : `${test.testCount} Test`;
  const badgeColor = getBadgeColor(test.testCount, test.category);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-xl">{test.title}</h3>
        <span className={`${badgeColor} text-xs font-semibold px-2 py-1 rounded`}>
          {badgeText}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{test.description}</p>
      
      {test.features.map((feature, idx) => (
        <div key={idx} className="flex items-center text-sm text-gray-500 mb-4">
          {idx === 0 ? (
            <Medal className="h-4 w-4 mr-2" />
          ) : (
            <Clock className="h-4 w-4 mr-2" />
          )}
          <span>{feature}</span>
        </div>
      ))}
      
      <div className="flex items-center justify-between mt-6">
        <div>
          <span className="text-lg font-bold text-primary">₹{test.price.toLocaleString()}</span>
        </div>
        <Button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white">
          Start Practicing
        </Button>
      </div>
    </motion.div>
  );
}
