import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").default("user").notNull(), // Can be "admin" or "user"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
});

export const usersRelations = relations(users, ({ many }) => ({
  doubtSessions: many(doubtSessions),
}));

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  modules: integer("modules").notNull(),
  price: integer("price").notNull(),
  discountPrice: integer("discount_price"),
  imageUrl: text("image_url").notNull(),
  categories: text("categories").array().notNull(),
  popular: boolean("popular").default(false),
  isLive: boolean("is_live").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  duration: true,
  modules: true,
  price: true,
  discountPrice: true,
  imageUrl: true,
  categories: true,
  popular: true,
  isLive: true,
});

export const doubtSessions = pgTable("doubt_sessions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoubtSessionSchema = createInsertSchema(doubtSessions).pick({
  subject: true,
  date: true,
  timeSlot: true,
  description: true,
  imageUrl: true,
  userId: true,
  name: true,
  email: true,
  phone: true,
});

export const doubtSessionsRelations = relations(doubtSessions, ({ one }) => ({
  user: one(users, {
    fields: [doubtSessions.userId],
    references: [users.id],
  }),
}));

export const testSeries = pgTable("test_series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  testCount: integer("test_count").notNull(),
  price: integer("price").notNull(),
  features: text("features").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestSeriesSchema = createInsertSchema(testSeries).pick({
  title: true,
  description: true,
  category: true,
  testCount: true,
  price: true,
  features: true,
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  testimonial: text("testimonial").notNull(),
  rating: integer("rating").notNull(),
  examName: text("exam_name"),
  rank: text("rank"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  name: true,
  testimonial: true,
  rating: true,
  examName: true,
  rank: true,
  imageUrl: true,
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFaqSchema = createInsertSchema(faqs).pick({
  question: true,
  answer: true,
  order: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type DoubtSession = typeof doubtSessions.$inferSelect;
export type InsertDoubtSession = z.infer<typeof insertDoubtSessionSchema>;

export type TestSeries = typeof testSeries.$inferSelect;
export type InsertTestSeries = z.infer<typeof insertTestSeriesSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;

// Site Configuration Schema
export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = typeof siteConfig.$inferInsert;
