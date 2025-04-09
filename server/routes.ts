import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { 
  insertUserSchema, 
  insertDoubtSessionSchema, 
  insertContactSchema,
  insertCourseSchema,
  insertTestSeriesSchema,
  insertTestimonialSchema,
  insertFaqSchema
} from "@shared/schema";
import { setupAuth, isAuthenticated, isAdmin, createInitialAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Initialize the database with sample data
  if (storage instanceof DatabaseStorage) {
    try {
      await storage.setupInitialData();
      console.log("Database initialized with sample data");
      
      // Create initial admin user if none exists
      await createInitialAdmin();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  // API routes
  app.get("/api/courses", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      let courses;
      
      if (category && category !== "All Exams") {
        courses = await storage.getCoursesByCategory(category);
      } else {
        courses = await storage.getAllCourses();
      }
      
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  
  app.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });
  
  app.get("/api/test-series", async (req: Request, res: Response) => {
    try {
      const testSeries = await storage.getAllTestSeries();
      res.json(testSeries);
    } catch (error) {
      console.error("Error fetching test series:", error);
      res.status(500).json({ message: "Failed to fetch test series" });
    }
  });
  
  app.get("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  
  app.get("/api/faqs", async (req: Request, res: Response) => {
    try {
      const faqs = await storage.getAllFAQs();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });
  
  // POST routes
  app.post("/api/doubt-sessions", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertDoubtSessionSchema.parse(req.body);
      
      // Create doubt session
      const doubtSession = await storage.createDoubtSession(validatedData);
      
      res.status(201).json({
        message: "Doubt session booked successfully!",
        doubtSession
      });
    } catch (error) {
      console.error("Error booking doubt session:", error);
      res.status(400).json({ message: "Failed to book doubt session", error });
    }
  });
  
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertContactSchema.parse(req.body);
      
      // Create contact message
      const contact = await storage.createContact(validatedData);
      
      res.status(201).json({
        message: "Message sent successfully!",
        contact
      });
    } catch (error) {
      console.error("Error sending contact message:", error);
      res.status(400).json({ message: "Failed to send message", error });
    }
  });
  
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(validatedData);
      
      res.status(201).json({
        message: "User registered successfully!",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(400).json({ message: "Failed to register user", error });
    }
  });

  // Admin API routes
  // Courses
  app.post("/api/admin/courses", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json({
        message: "Course created successfully",
        course
      });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Failed to create course", error });
    }
  });

  app.put("/api/admin/courses/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, validatedData);
      res.json({
        message: "Course updated successfully",
        course
      });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: "Failed to update course", error });
    }
  });

  app.delete("/api/admin/courses/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourse(id);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course", error });
    }
  });

  // Test Series
  app.post("/api/admin/test-series", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestSeriesSchema.parse(req.body);
      const testSeries = await storage.createTestSeries(validatedData);
      res.status(201).json({
        message: "Test series created successfully",
        testSeries
      });
    } catch (error) {
      console.error("Error creating test series:", error);
      res.status(400).json({ message: "Failed to create test series", error });
    }
  });

  app.put("/api/admin/test-series/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTestSeriesSchema.partial().parse(req.body);
      const testSeries = await storage.updateTestSeries(id, validatedData);
      res.json({
        message: "Test series updated successfully",
        testSeries
      });
    } catch (error) {
      console.error("Error updating test series:", error);
      res.status(400).json({ message: "Failed to update test series", error });
    }
  });

  app.delete("/api/admin/test-series/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestSeries(id);
      res.json({ message: "Test series deleted successfully" });
    } catch (error) {
      console.error("Error deleting test series:", error);
      res.status(500).json({ message: "Failed to delete test series", error });
    }
  });

  // Testimonials
  app.post("/api/admin/testimonials", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json({
        message: "Testimonial created successfully",
        testimonial
      });
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(400).json({ message: "Failed to create testimonial", error });
    }
  });

  app.put("/api/admin/testimonials/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(id, validatedData);
      res.json({
        message: "Testimonial updated successfully",
        testimonial
      });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(400).json({ message: "Failed to update testimonial", error });
    }
  });

  app.delete("/api/admin/testimonials/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestimonial(id);
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ message: "Failed to delete testimonial", error });
    }
  });

  // FAQs
  app.post("/api/admin/faqs", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFAQ(validatedData);
      res.status(201).json({
        message: "FAQ created successfully",
        faq
      });
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(400).json({ message: "Failed to create FAQ", error });
    }
  });

  app.put("/api/admin/faqs/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFaqSchema.partial().parse(req.body);
      const faq = await storage.updateFAQ(id, validatedData);
      res.json({
        message: "FAQ updated successfully",
        faq
      });
    } catch (error) {
      console.error("Error updating FAQ:", error);
      res.status(400).json({ message: "Failed to update FAQ", error });
    }
  });

  app.delete("/api/admin/faqs/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFAQ(id);
      res.json({ message: "FAQ deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ", error });
    }
  });

  // Contact messages
  app.get("/api/admin/contacts", isAdmin, async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages", error });
    }
  });

  app.delete("/api/admin/contacts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.json({ message: "Contact message deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message", error });
    }
  });

  // Doubt Sessions
  app.get("/api/admin/doubt-sessions", isAdmin, async (req: Request, res: Response) => {
    try {
      const doubtSessions = await storage.getAllDoubtSessions();
      res.json(doubtSessions);
    } catch (error) {
      console.error("Error fetching doubt sessions:", error);
      res.status(500).json({ message: "Failed to fetch doubt sessions", error });
    }
  });

  app.put("/api/admin/doubt-sessions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDoubtSessionSchema.partial().parse(req.body);
      const doubtSession = await storage.updateDoubtSession(id, validatedData);
      res.json({
        message: "Doubt session updated successfully",
        doubtSession
      });
    } catch (error) {
      console.error("Error updating doubt session:", error);
      res.status(400).json({ message: "Failed to update doubt session", error });
    }
  });

  app.delete("/api/admin/doubt-sessions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDoubtSession(id);
      res.json({ message: "Doubt session deleted successfully" });
    } catch (error) {
      console.error("Error deleting doubt session:", error);
      res.status(500).json({ message: "Failed to delete doubt session", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
