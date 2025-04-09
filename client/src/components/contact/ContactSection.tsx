import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  const contactInfo = [
    {
      title: "Our Location",
      content: ["123 Education Avenue, Knowledge Park", "New Delhi - 110001, India"],
      icon: <MapPin className="h-5 w-5 text-white" />,
    },
    {
      title: "Email Us",
      content: ["info@mathsmagictown.com", "support@mathsmagictown.com"],
      icon: <Mail className="h-5 w-5 text-white" />,
    },
    {
      title: "Call Us",
      content: ["+91 98765 43210", "+91 12345 67890"],
      icon: <Phone className="h-5 w-5 text-white" />,
    },
  ];

  const socialLinks = [
    { name: "Facebook", bgColor: "bg-blue-600 hover:bg-blue-700", icon: "facebook-f" },
    { name: "Twitter", bgColor: "bg-blue-400 hover:bg-blue-500", icon: "twitter" },
    { name: "Youtube", bgColor: "bg-red-600 hover:bg-red-700", icon: "youtube" },
    { name: "Instagram", bgColor: "bg-pink-600 hover:bg-pink-700", icon: "instagram" }
  ];

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          <motion.div 
            className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-bold text-3xl text-gray-800 mb-4">Get in Touch With Us</h2>
            <p className="text-gray-600 mb-8">
              Have questions or need more information? Reach out to us and our team will get back to you shortly.
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
                    href="#" 
                    className={`${link.bgColor} text-white p-3 rounded-full transition-colors`}
                    aria-label={link.name}
                  >
                    <i className={`fa-brands fa-${link.icon}`}></i>
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
