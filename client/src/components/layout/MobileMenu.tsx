import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { title: string; path: string }[];
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  // Close menu on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white">
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <ul className="space-y-4">
          {links.map((link, index) => (
            <li key={index} className="border-b border-gray-100 pb-2">
              <a 
                href={link.path} 
                className="block font-medium text-lg py-2 hover:text-primary transition-colors"
                onClick={handleLinkClick}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 space-y-3">
          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
            Login
          </Button>
          <Button className="w-full bg-primary text-white hover:bg-primary/90">
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
