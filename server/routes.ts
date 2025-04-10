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
  insertFaqSchema,
  insertTestSchema,
  insertQuestionSchema,
  insertOptionSchema,
  insertExplanationSchema
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
  
  app.get("/api/test-series/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const testSeries = await storage.getTestSeries(id);
      if (!testSeries) {
        return res.status(404).json({ message: "Test series not found" });
      }
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
      // Process the request body - convert empty email to null
      const contactData = {
        ...req.body,
        email: req.body.email || null
      };
      
      // Validate request body
      const validatedData = insertContactSchema.parse(contactData);
      
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
  
  // Tests Routes
  app.get("/api/tests", async (req: Request, res: Response) => {
    try {
      const tests = await storage.getAllTests();
      res.json(tests);
    } catch (error) {
      console.error("Error getting tests:", error);
      res.status(500).json({ message: "Failed to get tests", error });
    }
  });
  
  app.get("/api/test-series/:testSeriesId/tests", async (req: Request, res: Response) => {
    try {
      const testSeriesId = parseInt(req.params.testSeriesId);
      const tests = await storage.getTestsByTestSeries(testSeriesId);
      res.json(tests);
    } catch (error) {
      console.error("Error getting tests by test series:", error);
      res.status(500).json({ message: "Failed to get tests by test series", error });
    }
  });
  
  app.get("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getTest(id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Error getting test:", error);
      res.status(500).json({ message: "Failed to get test", error });
    }
  });
  
  app.post("/api/admin/tests", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestSchema.parse(req.body);
      const test = await storage.createTest(validatedData);
      res.status(201).json({
        message: "Test created successfully",
        test
      });
    } catch (error) {
      console.error("Error creating test:", error);
      res.status(400).json({ message: "Failed to create test", error });
    }
  });
  
  app.put("/api/admin/tests/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTestSchema.partial().parse(req.body);
      const test = await storage.updateTest(id, validatedData);
      res.json({
        message: "Test updated successfully",
        test
      });
    } catch (error) {
      console.error("Error updating test:", error);
      res.status(400).json({ message: "Failed to update test", error });
    }
  });
  
  // Link test to test series
  app.post("/api/admin/test-series/:testSeriesId/link-test", isAdmin, async (req: Request, res: Response) => {
    try {
      const testSeriesId = parseInt(req.params.testSeriesId);
      const { testId } = req.body;
      
      if (!testId) {
        return res.status(400).json({ message: "Test ID is required" });
      }
      
      // Get the test to update
      const test = await storage.getTest(parseInt(testId));
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Update the test's testSeriesId
      const updatedTest = await storage.updateTest(parseInt(testId), { 
        testSeriesId: testSeriesId 
      });
      
      res.json({ 
        message: "Test linked to test series successfully", 
        test: updatedTest 
      });
    } catch (error) {
      console.error("Error linking test to test series:", error);
      res.status(500).json({ message: "Failed to link test to test series", error });
    }
  });
  
  app.delete("/api/admin/tests/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTest(id);
      res.json({ message: "Test deleted successfully" });
    } catch (error) {
      console.error("Error deleting test:", error);
      res.status(500).json({ message: "Failed to delete test", error });
    }
  });
  
  // Questions Routes
  app.get("/api/tests/:testId/questions", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.testId);
      const questions = await storage.getQuestionsByTest(testId);
      res.json(questions);
    } catch (error) {
      console.error("Error getting questions by test:", error);
      res.status(500).json({ message: "Failed to get questions by test", error });
    }
  });
  
  app.get("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Also fetch options and explanation
      const options = await storage.getOptionsByQuestion(id);
      const explanation = await storage.getExplanationByQuestion(id);
      
      res.json({
        ...question,
        options,
        explanation
      });
    } catch (error) {
      console.error("Error getting question details:", error);
      res.status(500).json({ message: "Failed to get question details", error });
    }
  });
  
  app.post("/api/admin/questions", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData);
      res.status(201).json({
        message: "Question created successfully",
        question
      });
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(400).json({ message: "Failed to create question", error });
    }
  });
  
  app.put("/api/admin/questions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(id, validatedData);
      res.json({
        message: "Question updated successfully",
        question
      });
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(400).json({ message: "Failed to update question", error });
    }
  });
  
  app.delete("/api/admin/questions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuestion(id);
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question", error });
    }
  });
  
  // Options Routes
  app.post("/api/admin/options", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertOptionSchema.parse(req.body);
      const option = await storage.createOption(validatedData);
      res.status(201).json({
        message: "Option created successfully",
        option
      });
    } catch (error) {
      console.error("Error creating option:", error);
      res.status(400).json({ message: "Failed to create option", error });
    }
  });
  
  app.put("/api/admin/options/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOptionSchema.partial().parse(req.body);
      const option = await storage.updateOption(id, validatedData);
      res.json({
        message: "Option updated successfully",
        option
      });
    } catch (error) {
      console.error("Error updating option:", error);
      res.status(400).json({ message: "Failed to update option", error });
    }
  });
  
  app.delete("/api/admin/options/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOption(id);
      res.json({ message: "Option deleted successfully" });
    } catch (error) {
      console.error("Error deleting option:", error);
      res.status(500).json({ message: "Failed to delete option", error });
    }
  });
  
  // Explanation Routes
  app.post("/api/admin/explanations", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertExplanationSchema.parse(req.body);
      const explanation = await storage.createExplanation(validatedData);
      res.status(201).json({
        message: "Explanation created successfully",
        explanation
      });
    } catch (error) {
      console.error("Error creating explanation:", error);
      res.status(400).json({ message: "Failed to create explanation", error });
    }
  });
  
  app.put("/api/admin/explanations/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExplanationSchema.partial().parse(req.body);
      const explanation = await storage.updateExplanation(id, validatedData);
      res.json({
        message: "Explanation updated successfully",
        explanation
      });
    } catch (error) {
      console.error("Error updating explanation:", error);
      res.status(400).json({ message: "Failed to update explanation", error });
    }
  });
  
  app.delete("/api/admin/explanations/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExplanation(id);
      res.json({ message: "Explanation deleted successfully" });
    } catch (error) {
      console.error("Error deleting explanation:", error);
      res.status(500).json({ message: "Failed to delete explanation", error });
    }
  });
  
  // Bulk Create/Update Endpoints for Questions with Options and Explanations
  app.post("/api/admin/questions/bulk", isAdmin, async (req: Request, res: Response) => {
    try {
      const { questions } = req.body;
      const results = [];
      
      for (const item of questions) {
        // Create question
        const questionData = insertQuestionSchema.parse(item.question);
        const question = await storage.createQuestion(questionData);
        
        // Create options
        const options = [];
        for (const optionData of item.options) {
          const option = await storage.createOption({
            ...optionData,
            questionId: question.id
          });
          options.push(option);
        }
        
        // Create explanation if provided
        let explanation = null;
        if (item.explanation) {
          explanation = await storage.createExplanation({
            ...item.explanation,
            questionId: question.id
          });
        }
        
        results.push({
          question,
          options,
          explanation
        });
      }
      
      res.status(201).json({
        message: "Questions created successfully",
        results
      });
    } catch (error) {
      console.error("Error creating questions in bulk:", error);
      res.status(400).json({ message: "Failed to create questions in bulk", error });
    }
  });
  
  // File Upload for Tests
  app.post("/api/admin/tests/:id/upload", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // Here we would handle file upload using multer or other library
      // For now, we'll just update the fileUrl directly
      const { fileUrl } = req.body;
      const test = await storage.updateTest(id, { fileUrl });
      
      res.json({
        message: "Test file uploaded successfully",
        test
      });
    } catch (error) {
      console.error("Error uploading test file:", error);
      res.status(500).json({ message: "Failed to upload test file", error });
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

  // Site Configuration Routes
  app.get("/api/site-config", async (req: Request, res: Response) => {
    try {
      const config = await storage.getAllSiteConfig();
      res.json(config);
    } catch (error: any) {
      console.error("Error fetching site config:", error);
      res.status(500).json({ message: "Failed to fetch site configuration", error });
    }
  });
  
  app.get("/api/site-config/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const value = await storage.getSiteConfig(key);
      
      if (value === null) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      
      res.json({ key, value });
    } catch (error: any) {
      console.error("Error fetching site config key:", error);
      res.status(500).json({ message: "Failed to fetch configuration", error });
    }
  });
  
  app.put("/api/admin/site-config/:key", isAdmin, async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (value === undefined) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      await storage.updateSiteConfig(key, value);
      res.json({ message: "Configuration updated successfully", key, value });
    } catch (error: any) {
      console.error("Error updating site config:", error);
      res.status(500).json({ message: "Failed to update configuration", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
