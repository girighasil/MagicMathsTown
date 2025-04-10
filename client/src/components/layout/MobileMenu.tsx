import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, BarChart4 } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { title: string; path: string }[];
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
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
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
    navigate('/');
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
        {user && (
          <div className="mb-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border border-primary/30">
                <AvatarFallback className="text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.fullName || user.username}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation('/dashboard')}
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        )}
      
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
          {user ? (
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => handleNavigation('/auth')}
              >
                Login
              </Button>
              <Button 
                className="w-full bg-primary text-white hover:bg-primary/90"
                onClick={() => handleNavigation('/auth')}
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
