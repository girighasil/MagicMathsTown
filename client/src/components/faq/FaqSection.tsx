import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FaqItem from "./FaqItem";
import type { FAQ } from "@/types";

export default function FaqSection() {
  const { data: faqs, error, isLoading } = useQuery<FAQ[]>({
    queryKey: ['/api/faqs'],
    staleTime: 60000
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-bold text-3xl text-gray-800 mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to commonly asked questions about our courses and services.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              Failed to load FAQs. Please try again later.
            </div>
          ) : (
            <div className="space-y-4">
              {faqs?.map((faq) => (
                <FaqItem key={faq.id} faq={faq} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button variant="link" className="text-primary font-semibold hover:underline">
              <a href="#contact">Contact our support team <span className="ml-1">→</span></a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
