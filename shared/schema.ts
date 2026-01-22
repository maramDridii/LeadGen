import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tweets = pgTable("tweets", {
  id: serial("id").primaryKey(),
  twitterId: text("twitter_id").notNull().unique(),
  content: text("content").notNull(),
  authorUsername: text("author_username").notNull(),
  engagementScore: integer("engagement_score").default(0), // likes + retweets + replies
  relevanceScore: integer("relevance_score").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  twitterProfileUrl: text("twitter_profile_url"),
  status: text("status").default("new").notNull(), // new, contacted, replied, converted
  repliesCount: integer("replies_count").default(0),
  ctr: integer("ctr").default(0), // Click through rate percentage? or count? Let's assume count for now or score.
  conversions: integer("conversions").default(0),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  niche: text("niche").notNull(),
  content: text("content").notNull(), // The actual tweet text
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTweetSchema = createInsertSchema(tweets).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({ id: true, createdAt: true });

// === EXPLICIT API TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tweet = typeof tweets.$inferSelect;
export type InsertTweet = z.infer<typeof insertTweetSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;

// Request types
export type GenerateContentRequest = {
  topic: string;
  niche: string;
  count?: number;
};

export type UpdateLeadRequest = Partial<InsertLead>;

// Stats type
export type DashboardStats = {
  totalLeads: number;
  contacted: number;
  replies: number;
  conversions: number;
  ctrAverage: number;
};
