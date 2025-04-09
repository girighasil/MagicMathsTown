import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { 
  insertUserSchema, 
  insertDoubtSessionSchema, 
  insertContactSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database with sample data
  if (storage instanceof DatabaseStorage) {
    try {
      await storage.setupInitialData();
      console.log("Database initialized with sample data");
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

  const httpServer = createServer(app);
  return httpServer;
}
