import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import ContactForm from "./ContactForm";
import { useSiteConfig } from "@/hooks/use-site-config";

export default function ContactSection() {
  const { config } = useSiteConfig();
  
  const contactConfig = config?.contact || {
    title: 'Get In Touch',
    subtitle: 'Have questions? Fill out the form below and we\'ll get back to you as soon as possible.',
    address: '123 Learning Street, Education City, IN 110001',
    phone: '+91 98765 43210',
    email: 'contact@mathsmagictown.com',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.2536925461087!2d77.20659841507996!3d28.557120582445535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce26f903969d7%3A0x8367180c6de2ecc2!2sAIIMS%20Delhi!5e0!3m2!1sen!2sin!4v1643448804843!5m2!1sen!2sin'
  };
  
  const social = config?.social || {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/in/',
    youtube: 'https://youtube.com/'
  };

  const contactInfo = [
    {
      title: "Our Location",
      content: [contactConfig.address],
      icon: <MapPin className="h-5 w-5 text-white" />,
    },
    {
      title: "Email Us",
      content: [contactConfig.email],
      icon: <Mail className="h-5 w-5 text-white" />,
    },
    {
      title: "Call Us",
      content: [contactConfig.phone],
      icon: <Phone className="h-5 w-5 text-white" />,
    },
  ];

  const socialLinks = [
    { 
      name: "Facebook", 
      bgColor: "bg-blue-600 hover:bg-blue-700", 
      icon: <Facebook className="h-4 w-4" />,
      url: social.facebook 
    },
    { 
      name: "Twitter", 
      bgColor: "bg-blue-400 hover:bg-blue-500", 
      icon: <Twitter className="h-4 w-4" />,
      url: social.twitter 
    },
    { 
      name: "Youtube", 
      bgColor: "bg-red-600 hover:bg-red-700", 
      icon: <Youtube className="h-4 w-4" />,
      url: social.youtube 
    },
    { 
      name: "Instagram", 
      bgColor: "bg-pink-600 hover:bg-pink-700", 
      icon: <Instagram className="h-4 w-4" />,
      url: social.instagram 
    }
  ];

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {contactConfig.mapUrl && (
          <div className="mb-12 rounded-lg overflow-hidden shadow-md h-[300px]">
            <iframe 
              src={contactConfig.mapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy"
              title="Location map" 
            />
          </div>
        )}
        <div className="flex flex-col lg:flex-row">
          <motion.div 
            className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-bold text-3xl text-gray-800 mb-4">{contactConfig.title}</h2>
            <p className="text-gray-600 mb-8">
              {contactConfig.subtitle}
            </p>
            
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="bg-primary rounded-full p-3 mr-4">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-gray-600">
                      {item.content.map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < item.content.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Connect With Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${link.bgColor} text-white p-3 rounded-full transition-colors flex items-center justify-center`}
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="font-semibold text-2xl text-gray-800 mb-6">Send Us a Message</h3>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
