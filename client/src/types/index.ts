export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  modules: number;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  categories: string[];
  category?: string; // For backward compatibility
  popular: boolean;
  isLive: boolean;
}

export interface TestSeries {
  id: number;
  title: string;
  description: string;
  category: string;
  testCount: number;
  price: number;
  features: string[];
  isPublished?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  testimonial: string;
  rating: number;
  examName?: string;
  rank?: string;
  imageUrl?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface DoubtSession {
  subject: string;
  date: string;
  timeSlot: string;
  description: string;
  imageUrl?: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}
