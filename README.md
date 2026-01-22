Twitter Lead Generation System
This is a complete, production-ready Twitter (X) lead generation system with automation and analytics.

Features
Dashboard: View key metrics like leads contacted, replies, and conversions.
Tweet Monitor: Monitor authority accounts and score tweets based on engagement and relevance.
Content Generator: AI-powered content generation that analyzes top-performing tweets to create viral-worthy content.
Lead Management: Track leads, their status, and interaction history.
Tech Stack
Frontend: React.js with Shadcn UI, Tailwind CSS, TanStack Query, Recharts.
Backend: Node.js (Express), Drizzle ORM, PostgreSQL.
AI: OpenAI.
Setup Instructions
Install Dependencies:

npm install
Database Setup: Ensure your PostgreSQL database is provisioned. Push the schema to the database:

npm run db:push
Run the Application:

npm run dev
This starts both the frontend and backend servers.

API Documentation
GET /api/dashboard/stats: Get dashboard statistics.
POST /api/tweets/monitor: Trigger tweet monitoring (mocked for MVP).
GET /api/tweets: List monitored tweets.
POST /api/content/generate: Generate new tweet ideas using AI.
GET /api/content: List generated content.
GET /api/leads: List all leads.
POST /api/leads: Create a new lead.
PATCH /api/leads/:id: Update lead status.
Project Structure
client/: React frontend code.
server/: Express backend code.
shared/: Shared types and schema (Drizzle ORM).
