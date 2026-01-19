import { db } from "./db";
import {
  users, tweets, leads, generatedContent,
  type User, type InsertUser,
  type Tweet, type InsertTweet,
  type Lead, type InsertLead,
  type GeneratedContent, type InsertGeneratedContent,
  type DashboardStats
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat/storage";

export interface IStorage extends IChatStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tweets
  getTweets(): Promise<Tweet[]>;
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  getHighEngagementTweets(): Promise<Tweet[]>;

  // Leads
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;

  // Content
  getGeneratedContent(): Promise<GeneratedContent[]>;
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Mixin chat storage methods
  getConversation = chatStorage.getConversation;
  getAllConversations = chatStorage.getAllConversations;
  createConversation = chatStorage.createConversation;
  deleteConversation = chatStorage.deleteConversation;
  getMessagesByConversation = chatStorage.getMessagesByConversation;
  createMessage = chatStorage.createMessage;

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Tweets
  async getTweets(): Promise<Tweet[]> {
    return await db.select().from(tweets).orderBy(desc(tweets.createdAt));
  }

  async createTweet(tweet: InsertTweet): Promise<Tweet> {
    // Upsert by twitterId to avoid duplicates
    const [newTweet] = await db.insert(tweets)
      .values(tweet)
      .onConflictDoUpdate({
        target: tweets.twitterId,
        set: { 
          engagementScore: tweet.engagementScore,
          relevanceScore: tweet.relevanceScore 
        }
      })
      .returning();
    return newTweet;
  }

  async getHighEngagementTweets(): Promise<Tweet[]> {
    return await db.select().from(tweets)
      .where(sql`engagement_score > 50`) // Arbitrary threshold for "High"
      .orderBy(desc(tweets.relevanceScore), desc(tweets.engagementScore));
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: number, leadUpdate: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db.update(leads)
      .set(leadUpdate)
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  // Content
  async getGeneratedContent(): Promise<GeneratedContent[]> {
    return await db.select().from(generatedContent).orderBy(desc(generatedContent.createdAt));
  }

  async createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent> {
    const [newContent] = await db.insert(generatedContent).values(content).returning();
    return newContent;
  }

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const [leadsCount] = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const [contactedCount] = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, 'contacted'));
    const [repliesCount] = await db.select({ count: sql<number>`sum(replies_count)` }).from(leads);
    const [conversionsCount] = await db.select({ count: sql<number>`sum(conversions)` }).from(leads);
    
    // Calculate CTR average (if available) - simplifying for MVP
    const [ctrAvg] = await db.select({ avg: sql<number>`avg(ctr)` }).from(leads);

    return {
      totalLeads: Number(leadsCount?.count || 0),
      contacted: Number(contactedCount?.count || 0),
      replies: Number(repliesCount?.count || 0),
      conversions: Number(conversionsCount?.count || 0),
      ctrAverage: Number(ctrAvg?.avg || 0),
    };
  }
}

export const storage = new DatabaseStorage();
