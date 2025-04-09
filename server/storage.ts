import { 
  users, type User, type InsertUser,
  courses, type Course, type InsertCourse,
  doubtSessions, type DoubtSession, type InsertDoubtSession,
  testSeries, type TestSeries, type InsertTestSeries,
  testimonials, type Testimonial, type InsertTestimonial,
  contacts, type Contact, type InsertContact,
  faqs, type FAQ, type InsertFAQ
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Courses
  getAllCourses(): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Doubt Sessions
  createDoubtSession(session: InsertDoubtSession): Promise<DoubtSession>;
  getDoubtSessionsByUser(userId: number): Promise<DoubtSession[]>;
  getAllDoubtSessions(): Promise<DoubtSession[]>;
  
  // Test Series
  getAllTestSeries(): Promise<TestSeries[]>;
  getTestSeries(id: number): Promise<TestSeries | undefined>;
  createTestSeries(testSeries: InsertTestSeries): Promise<TestSeries>;
  
  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Contact Messages
  createContact(contact: InsertContact): Promise<Contact>;
  
  // FAQs
  getAllFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private doubtSessions: Map<number, DoubtSession>;
  private testSeries: Map<number, TestSeries>;
  private testimonials: Map<number, Testimonial>;
  private contacts: Map<number, Contact>;
  private faqs: Map<number, FAQ>;
  
  private userId: number;
  private courseId: number;
  private doubtSessionId: number;
  private testSeriesId: number;
  private testimonialId: number;
  private contactId: number;
  private faqId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.doubtSessions = new Map();
    this.testSeries = new Map();
    this.testimonials = new Map();
    this.contacts = new Map();
    this.faqs = new Map();
    
    this.userId = 1;
    this.courseId = 1;
    this.doubtSessionId = 1;
    this.testSeriesId = 1;
    this.testimonialId = 1;
    this.contactId = 1;
    this.faqId = 1;
    
    // Setup initial data
    this.setupInitialData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Courses
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      course => course.category === category
    );
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const createdAt = new Date();
    const course: Course = { ...insertCourse, id, createdAt };
    this.courses.set(id, course);
    return course;
  }
  
  // Doubt Sessions
  async createDoubtSession(insertSession: InsertDoubtSession): Promise<DoubtSession> {
    const id = this.doubtSessionId++;
    const createdAt = new Date();
    const status = "pending";
    const session: DoubtSession = { ...insertSession, id, status, createdAt };
    this.doubtSessions.set(id, session);
    return session;
  }
  
  async getDoubtSessionsByUser(userId: number): Promise<DoubtSession[]> {
    return Array.from(this.doubtSessions.values()).filter(
      session => session.userId === userId
    );
  }
  
  async getAllDoubtSessions(): Promise<DoubtSession[]> {
    return Array.from(this.doubtSessions.values());
  }
  
  // Test Series
  async getAllTestSeries(): Promise<TestSeries[]> {
    return Array.from(this.testSeries.values());
  }
  
  async getTestSeries(id: number): Promise<TestSeries | undefined> {
    return this.testSeries.get(id);
  }
  
  async createTestSeries(insertTestSeries: InsertTestSeries): Promise<TestSeries> {
    const id = this.testSeriesId++;
    const createdAt = new Date();
    const testSeries: TestSeries = { ...insertTestSeries, id, createdAt };
    this.testSeries.set(id, testSeries);
    return testSeries;
  }
  
  // Testimonials
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const createdAt = new Date();
    const testimonial: Testimonial = { ...insertTestimonial, id, createdAt };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
  
  // Contact Messages
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const createdAt = new Date();
    const contact: Contact = { ...insertContact, id, createdAt };
    this.contacts.set(id, contact);
    return contact;
  }
  
  // FAQs
  async getAllFAQs(): Promise<FAQ[]> {
    return Array.from(this.faqs.values()).sort((a, b) => a.order - b.order);
  }
  
  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const id = this.faqId++;
    const createdAt = new Date();
    const faq: FAQ = { ...insertFAQ, id, createdAt };
    this.faqs.set(id, faq);
    return faq;
  }
  
  // Initialize with sample data
  private setupInitialData() {
    // Create courses
    const courseData: InsertCourse[] = [
      {
        title: "JEE Main Mathematics",
        description: "Comprehensive course covering all JEE Main mathematics topics with regular doubt sessions and weekly tests.",
        duration: "6 months",
        modules: 24,
        price: 15999,
        discountPrice: 12999,
        imageUrl: "https://images.unsplash.com/photo-1678893574262-74f8451fea2f",
        category: "JEE Main/Advanced",
        popular: true,
        isLive: true
      },
      {
        title: "Banking Exams Quantitative Aptitude",
        description: "Master quantitative aptitude for banking exams with shortcut techniques and extensive practice.",
        duration: "3 months",
        modules: 15,
        price: 8999,
        discountPrice: 6499,
        imageUrl: "https://images.unsplash.com/photo-1609743522653-52354461eb27",
        category: "Banking",
        popular: false,
        isLive: true
      },
      {
        title: "Advanced Calculus for IIT-JEE",
        description: "Specialized course focusing on advanced calculus problems frequently appearing in IIT-JEE Advanced.",
        duration: "2 months",
        modules: 8,
        price: 7999,
        discountPrice: 5999,
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
        category: "JEE Main/Advanced",
        popular: false,
        isLive: true
      }
    ];
    
    courseData.forEach(course => {
      this.createCourse(course);
    });
    
    // Create test series
    const testSeriesData: InsertTestSeries[] = [
      {
        title: "JEE Main Mock Test Series",
        description: "Complete mock tests with JEE Main pattern, difficulty level and time constraints.",
        category: "JEE Main/Advanced",
        testCount: 30,
        price: 3499,
        features: ["All India Rank Comparison", "Detailed Performance Analysis"]
      },
      {
        title: "Topic-wise Test Series",
        description: "Focus on specific topics with our specialized test series for targeted improvement.",
        category: "General",
        testCount: 100,
        price: 2999,
        features: ["Chapter-wise Questions", "Video Solutions Included"]
      },
      {
        title: "Previous Year Papers",
        description: "Practice with actual questions from previous years with detailed explanations.",
        category: "General",
        testCount: 10,
        price: 1999,
        features: ["Year-wise Categorized", "Trend Analysis Reports"]
      }
    ];
    
    testSeriesData.forEach(testSeries => {
      this.createTestSeries(testSeries);
    });
    
    // Create testimonials
    const testimonialData: InsertTestimonial[] = [
      {
        name: "Rahul Sharma",
        testimonial: "The doubt clearing sessions at Maths Magic Town were a game-changer for me. I could get all my calculus concepts cleared just before my JEE Advanced exam. Secured AIR 342!",
        rating: 5,
        examName: "JEE Advanced 2023",
        rank: "AIR 342",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
      },
      {
        name: "Priya Patel",
        testimonial: "The practice tests were perfect replicas of the actual SBI PO exam. The quantitative section became my strongest area thanks to the topic-wise tests. Cleared the exam in my first attempt!",
        rating: 4.5,
        examName: "SBI PO 2023",
        rank: "",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
      },
      {
        name: "Aditya Verma",
        testimonial: "Mathematics used to be my weak point until I joined Maths Magic Town. The way they break down complex topics made a huge difference. Scored 98 percentile in JEE Main mathematics!",
        rating: 5,
        examName: "JEE Main 2023",
        rank: "98 percentile",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
      }
    ];
    
    testimonialData.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });
    
    // Create FAQs
    const faqData: InsertFAQ[] = [
      {
        question: "How do the doubt clearing sessions work?",
        answer: "You can book a doubt clearing session through our platform by selecting your subject, date, and time slot. Once confirmed, you'll connect with our expert teacher via video call at the scheduled time. You can also upload your doubts beforehand for more efficient resolution. Each session lasts 30-45 minutes.",
        order: 1
      },
      {
        question: "Are the practice tests regularly updated?",
        answer: "Yes, our practice tests are regularly updated to reflect the latest exam patterns and question types. We analyze recent exams and incorporate new question styles to ensure you're always practicing with the most relevant material.",
        order: 2
      },
      {
        question: "Can I access the course content on mobile devices?",
        answer: "Absolutely! Our platform is fully responsive and optimized for mobile devices. You can access all course content, practice tests, and even attend doubt clearing sessions from your smartphone or tablet.",
        order: 3
      },
      {
        question: "How long do I have access to the course materials?",
        answer: "Once enrolled, you'll have access to all course materials until your exam date, plus an additional 3 months. For long-term courses like JEE preparation, this typically means 15-18 months of access.",
        order: 4
      },
      {
        question: "Do you offer any scholarships or discounts?",
        answer: "Yes, we offer merit-based scholarships for deserving students. We also run seasonal discounts and special offers for group enrollments. Contact our support team to learn about current scholarship opportunities.",
        order: 5
      }
    ];
    
    faqData.forEach(faq => {
      this.createFAQ(faq);
    });
  }
}

export const storage = new MemStorage();
