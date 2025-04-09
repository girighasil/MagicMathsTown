import { useState } from "react";
import { useSiteConfig } from "@/hooks/use-site-config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CONTACT_SUBJECTS } from "@/lib/constants";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { config } = useSiteConfig();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const contactConfig = config?.contact || {
    title: 'Get In Touch',
    subtitle: 'Have questions? Fill out the form below and we\'ll get back to you as soon as possible.',
    address: '123 Learning Street, Education City, IN 110001',
    phone: '+91 98765 43210',
    email: 'contact@mathsmagictown.com',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.2536925461087!2d77.20659841507996!3d28.557120582445535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce26f903969d7%3A0x8367180c6de2ecc2!2sAIIMS%20Delhi!5e0!3m2!1sen!2sin!4v1643448804843!5m2!1sen!2sin'
  };
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });
  
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/contact', data);
      
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{contactConfig.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{contactConfig.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_SUBJECTS.map((subject) => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 
                    "Sending..." : 
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  }
                </Button>
              </form>
            </Form>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                {contactConfig.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-medium">Address</h4>
                      <p className="text-gray-600 mt-1">{contactConfig.address}</p>
                    </div>
                  </div>
                )}
                
                {contactConfig.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <a href={`mailto:${contactConfig.email}`} className="text-gray-600 hover:text-primary transition-colors mt-1 block">
                        {contactConfig.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {contactConfig.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-medium">Phone</h4>
                      <a href={`tel:${contactConfig.phone}`} className="text-gray-600 hover:text-primary transition-colors mt-1 block">
                        {contactConfig.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Google Maps */}
            {contactConfig.mapUrl && (
              <div className="rounded-lg overflow-hidden shadow-md h-[300px]">
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
          </div>
        </div>
      </div>
    </section>
  );
}