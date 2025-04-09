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
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Courses
  getAllCourses(): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Doubt Sessions
  createDoubtSession(session: InsertDoubtSession): Promise<DoubtSession>;
  getDoubtSessionsByUser(userId: number): Promise<DoubtSession[]>;
  getAllDoubtSessions(): Promise<DoubtSession[]>;
  updateDoubtSession(id: number, session: Partial<InsertDoubtSession>): Promise<DoubtSession>;
  deleteDoubtSession(id: number): Promise<void>;
  
  // Test Series
  getAllTestSeries(): Promise<TestSeries[]>;
  getTestSeries(id: number): Promise<TestSeries | undefined>;
  createTestSeries(testSeries: InsertTestSeries): Promise<TestSeries>;
  updateTestSeries(id: number, testSeries: Partial<InsertTestSeries>): Promise<TestSeries>;
  deleteTestSeries(id: number): Promise<void>;
  
  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<void>;
  
  // Contact Messages
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  deleteContact(id: number): Promise<void>;
  
  // FAQs
  getAllFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  updateFAQ(id: number, faq: Partial<InsertFAQ>): Promise<FAQ>;
  deleteFAQ(id: number): Promise<void>;
}

import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import { sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
  
  // Courses
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }
  
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.category, category));
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();
    return course;
  }
  
  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }
  
  // Doubt Sessions
  async createDoubtSession(insertSession: InsertDoubtSession): Promise<DoubtSession> {
    const [session] = await db.insert(doubtSessions).values(insertSession).returning();
    return session;
  }
  
  async getDoubtSessionsByUser(userId: number): Promise<DoubtSession[]> {
    return await db.select().from(doubtSessions).where(eq(doubtSessions.userId, userId));
  }
  
  async getAllDoubtSessions(): Promise<DoubtSession[]> {
    return await db.select().from(doubtSessions);
  }
  
  async updateDoubtSession(id: number, sessionData: Partial<InsertDoubtSession>): Promise<DoubtSession> {
    const [session] = await db
      .update(doubtSessions)
      .set(sessionData)
      .where(eq(doubtSessions.id, id))
      .returning();
    return session;
  }
  
  async deleteDoubtSession(id: number): Promise<void> {
    await db.delete(doubtSessions).where(eq(doubtSessions.id, id));
  }
  
  // Test Series
  async getAllTestSeries(): Promise<TestSeries[]> {
    return await db.select().from(testSeries);
  }
  
  async getTestSeries(id: number): Promise<TestSeries | undefined> {
    const [series] = await db.select().from(testSeries).where(eq(testSeries.id, id));
    return series;
  }
  
  async createTestSeries(insertTestSeries: InsertTestSeries): Promise<TestSeries> {
    const [series] = await db.insert(testSeries).values(insertTestSeries).returning();
    return series;
  }
  
  async updateTestSeries(id: number, testSeriesData: Partial<InsertTestSeries>): Promise<TestSeries> {
    const [series] = await db
      .update(testSeries)
      .set(testSeriesData)
      .where(eq(testSeries.id, id))
      .returning();
    return series;
  }
  
  async deleteTestSeries(id: number): Promise<void> {
    await db.delete(testSeries).where(eq(testSeries.id, id));
  }
  
  // Testimonials
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }
  
  async updateTestimonial(id: number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial> {
    const [testimonial] = await db
      .update(testimonials)
      .set(testimonialData)
      .where(eq(testimonials.id, id))
      .returning();
    return testimonial;
  }
  
  async deleteTestimonial(id: number): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }
  
  // Contact Messages
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }
  
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
  
  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }
  
  // FAQs
  async getAllFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs).orderBy(asc(faqs.order));
  }
  
  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const [faq] = await db.insert(faqs).values(insertFAQ).returning();
    return faq;
  }
  
  async updateFAQ(id: number, faqData: Partial<InsertFAQ>): Promise<FAQ> {
    const [faq] = await db
      .update(faqs)
      .set(faqData)
      .where(eq(faqs.id, id))
      .returning();
    return faq;
  }
  
  async deleteFAQ(id: number): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, id));
  }
  
  // Initialize the database with sample data
  async setupInitialData() {
    const courseCount = await db.select({ count: sql`count(*)` }).from(courses);
    
    if (courseCount[0].count === '0') {
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
      
      await db.insert(courses).values(courseData);
      
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
      
      await db.insert(testSeries).values(testSeriesData);
      
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
          rating: 4,
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
      
      await db.insert(testimonials).values(testimonialData);
      
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
      
      await db.insert(faqs).values(faqData);
    }
  }
}

export const storage = new DatabaseStorage();
