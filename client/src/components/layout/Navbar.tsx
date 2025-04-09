import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import MobileMenu from './MobileMenu';
import PromoBanner from './PromoBanner';
import { SquareRadical } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { title: 'Home', path: '#home' },
    { title: 'Courses', path: '#courses' },
    { title: 'Doubt Classes', path: '#doubt-classes' },
    { title: 'Practice Tests', path: '#practice-tests' },
    { title: 'Success Stories', path: '#testimonials' },
    { title: 'Contact', path: '#contact' }
  ];

  return (
    <header className={`sticky top-0 bg-white z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <nav className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="bg-primary rounded-lg p-2 mr-2">
              <SquareRadical className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">Maths Magic Town</span>
          </Link>
        </div>
        
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="hidden md:flex flex-col md:flex-row w-full md:w-auto md:items-center mt-4 md:mt-0">
          <ul className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.path} 
                  className="font-medium hover:text-primary transition-colors duration-200"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 md:mt-0 md:ml-8 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Login
            </Button>
            <Button className="bg-primary text-white hover:bg-primary/90">
              Register
            </Button>
          </div>
        </div>
      </nav>
      
      <PromoBanner />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} links={navLinks} />
    </header>
  );
}
