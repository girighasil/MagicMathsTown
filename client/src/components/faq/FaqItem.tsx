import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { FAQ } from "@/types";

interface FaqItemProps {
  faq: FAQ;
}

export default function FaqItem({ faq }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(faq.id === 1); // First FAQ open by default

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div 
      className="border border-gray-200 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-800">{faq.question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
