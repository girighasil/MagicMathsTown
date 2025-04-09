import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SAMPLE_QUESTION } from "@/lib/constants";

export default function SampleQuestion() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="bg-primary text-white p-4">
        <h3 className="font-semibold text-xl">Sample Question Preview</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">
              Question {SAMPLE_QUESTION.number} of {SAMPLE_QUESTION.total}
            </span>
            <span className="bg-blue-100 text-primary text-xs font-semibold px-2 py-1 rounded">
              {SAMPLE_QUESTION.category}
            </span>
          </div>
          
          <p className="font-medium text-gray-800 mb-4">
            {SAMPLE_QUESTION.question}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {SAMPLE_QUESTION.options.map((option) => (
              <div 
                key={option.id}
                className={`border rounded p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedOption === option.id ? "border-primary bg-blue-50" : "border-gray-300"
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <span className="font-medium mr-2">{option.id}.</span> {option.text}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Previous
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Next Question
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
