import { useSiteConfig } from "@/hooks/use-site-config";
import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { config } = useSiteConfig();
  type FooterLink = {
    title: string;
    url: string;
  };
  
  const footer = config?.footer || {
    text: '© 2025 Maths Magic Town. All rights reserved.',
    address: '123 Learning Street, Education City, IN 110001',
    phone: '+91 98765 43210',
    email: 'contact@mathsmagictown.com',
    links: [
      { title: 'Terms of Service', url: '/terms' },
      { title: 'Privacy Policy', url: '/privacy' },
      { title: 'Refund Policy', url: '/refund' }
    ] as FooterLink[]
  };
  
  const social = config?.social || {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/in/',
    youtube: 'https://youtube.com/'
  };

  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">About Us</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Maths Magic Town is dedicated to helping students excel in competitive exams through personalized coaching and comprehensive practice materials.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-4 mt-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-5 w-5 text-primary-200 hover:text-white transition-colors" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-5 w-5 text-primary-200 hover:text-white transition-colors" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-5 w-5 text-primary-200 hover:text-white transition-colors" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5 text-primary-200 hover:text-white transition-colors" />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube className="h-5 w-5 text-primary-200 hover:text-white transition-colors" />
                </a>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#courses" className="text-primary-200 hover:text-white transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/#practice-tests" className="text-primary-200 hover:text-white transition-colors">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link href="/#doubt-classes" className="text-primary-200 hover:text-white transition-colors">
                  Doubt Classes
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="text-primary-200 hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Important Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Important Links</h3>
            <ul className="space-y-2">
              {footer.links.map((link: FooterLink, index: number) => (
                <li key={index}>
                  <Link href={link.url} className="text-primary-200 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Contact Us</h3>
            <ul className="space-y-3">
              {footer.address && (
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary-200 mr-2 mt-0.5 shrink-0" />
                  <span className="text-primary-100 text-sm">{footer.address}</span>
                </li>
              )}
              {footer.phone && (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-primary-200 mr-2 shrink-0" />
                  <a href={`tel:${footer.phone}`} className="text-primary-100 text-sm hover:text-white transition-colors">
                    {footer.phone}
                  </a>
                </li>
              )}
              {footer.email && (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-primary-200 mr-2 shrink-0" />
                  <a href={`mailto:${footer.email}`} className="text-primary-100 text-sm hover:text-white transition-colors">
                    {footer.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-primary-800 mt-8 pt-6 text-center text-primary-200 text-sm">
          {footer.text}
        </div>
      </div>
    </footer>
  );
}