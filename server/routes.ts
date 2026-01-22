import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

import { TwitterApi } from "twitter-api-v2";

// Initialize Twitter Client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || "",
  appSecret: process.env.TWITTER_API_SECRET || "",
  accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
  accessSecret: process.env.TWITTER_ACCESS_SECRET || "",
});

const readOnlyClient = twitterClient.readOnly;

// Initialize OpenAI for our custom routes (integration sets up env vars)
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === DASHBOARD ===
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === TWEETS ===
  app.post(api.tweets.monitor.path, async (req, res) => {
    try {
      const { offer } = api.tweets.monitor.input.parse(req.body);
      
      // Real Twitter API Call
      let fetchedTweets = [];
      try {
        // Search for recent tweets matching the offer/niche keywords
        const searchResult = await readOnlyClient.v2.search(offer, {
          "tweet.fields": ["public_metrics", "author_id", "created_at"],
          max_results: 10,
        });

        for (const tweet of searchResult.data.data) {
          const metrics = tweet.public_metrics || { retweet_count: 0, reply_count: 0, like_count: 0 };
          const engagement = metrics.retweet_count + metrics.reply_count + metrics.like_count;
          
          // Use AI to score relevance (simple prompt)
          const relevanceResponse = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [{ 
              role: "user", 
              content: `On a scale of 0-100, how relevant is this tweet to the offer "${offer}"? Output ONLY the number.\n\nTweet: ${tweet.text}` 
            }],
            max_completion_tokens: 5,
          });
          const relevanceResult = (relevanceResponse.choices[0].message.content as any) || "50";
          const relevanceScore = parseInt(Array.isArray(relevanceResult) ? relevanceResult[0] : relevanceResult) || 50;

          fetchedTweets.push({
            twitterId: tweet.id,
            authorUsername: tweet.author_id || "unknown", // V2 returns ID, would need another call for handle
            content: tweet.text,
            engagementScore: engagement,
            relevanceScore: relevanceScore
          });
        }
      } catch (twitterErr) {
        console.error("Twitter API Error:", twitterErr);
        throw new Error("Failed to fetch real Twitter data. Please check your credentials.");
      }

      const savedTweets = [];
      for (const t of fetchedTweets) {
        const saved = await storage.createTweet(t);
        savedTweets.push(saved);
      }

      res.json(savedTweets);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to monitor tweets" });
    }
  });

  app.get(api.tweets.list.path, async (req, res) => {
    const tweets = await storage.getTweets();
    res.json(tweets);
  });

  // === CONTENT GENERATION (AI) ===
  app.post(api.content.generate.path, async (req, res) => {
    try {
      const { topic, niche, count } = api.content.generate.input.parse(req.body);

      // Fetch high engagement tweets for context
      const highEngagementTweets = await storage.getHighEngagementTweets();
      const contextTweets = highEngagementTweets.slice(0, 5).map(t => t.content).join("\n- ");

      // Use OpenAI to generate tweets
      const prompt = `Generate ${count} engaging tweet ideas for the niche "${niche}" about the topic "${topic}".
      
      Analyze these top-performing tweets for style and format patterns:
      ${contextTweets}

      Based on these patterns, generate new tweets.
      Each tweet should be distinct, viral-worthy, and under 280 characters. 
      Return ONLY a raw JSON array of strings, e.g. ["Tweet 1", "Tweet 2"].`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // json_object requires valid JSON in output
      });

      // Handle JSON parsing safely
      let generatedTexts: string[] = [];
      try {
        const content = response.choices[0].message.content || "{}";
        const parsed = JSON.parse(content);
        const rawTexts = Array.isArray(parsed) ? parsed : (parsed.tweets || Object.values(parsed));
        generatedTexts = rawTexts.filter((v: any) => typeof v === 'string') as string[];
      } catch (e) {
        console.error("Failed to parse AI response", e);
        generatedTexts = ["Error generating content. Please try again."];
      }

      const savedContent = [];
      for (const text of generatedTexts) {
        const saved = await storage.createGeneratedContent({
          topic,
          niche,
          content: text
        });
        savedContent.push(saved);
      }

      res.json(savedContent);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  app.get(api.content.list.path, async (req, res) => {
    const content = await storage.getGeneratedContent();
    res.json(content);
  });

  // === LEADS ===
  app.get(api.leads.list.path, async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch(api.leads.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.leads.update.input.parse(req.body);
      const lead = await storage.updateLead(id, input);
      res.json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Lead not found" });
    }
  });

  // No seed data - keeping it 100% real
  return httpServer;
}
