# Twitter Lead Generation System

## Overview

A Twitter (X) lead generation system with automation and analytics. The application monitors authority accounts, scores tweets based on engagement and relevance, generates AI-powered content, and tracks leads through a CRM interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state and caching
- **UI Components**: Shadcn UI with Radix primitives
- **Styling**: Tailwind CSS with custom dark theme (Deep Space Blue)
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for dashboard analytics

The frontend follows a page-based architecture with reusable components. Pages include Dashboard, TweetMonitor, ContentGenerator, and Leads CRM. Custom hooks abstract API interactions (`use-dashboard`, `use-tweets`, `use-leads`, `use-content`).

### Backend Architecture
- **Framework**: Express.js (v5) with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Build Tool**: ESBuild for production bundling, Vite for development

The backend uses a storage abstraction layer (`server/storage.ts`) implementing the `IStorage` interface, allowing for potential database swapping. Routes are registered in `server/routes.ts` with shared type definitions between frontend and backend.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**: 
  - `users` - Authentication and user management
  - `tweets` - Monitored tweets with engagement/relevance scores
  - `leads` - CRM data with status tracking (new, contacted, replied, converted)
  - `generatedContent` - AI-generated tweet content

### AI Integration
- **Provider**: OpenAI via Replit AI Integrations
- **Use Case**: Analyzing top-performing tweets and generating viral-worthy content tailored to niches

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database schemas and Zod validation schemas
- `routes.ts` - API contract definitions with type-safe request/response schemas

## External Dependencies

### Third-Party Services
- **Twitter API**: Used via `twitter-api-v2` package for fetching tweets and monitoring authority accounts. Requires environment variables: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
- **OpenAI**: For AI content generation. Configured via Replit AI Integrations with `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable. Replit handles provisioning automatically.

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Data fetching and caching
- `zod` - Schema validation
- `framer-motion` - Animations
- `recharts` - Chart visualizations
- `twitter-api-v2` - Twitter API client
- `openai` - OpenAI API client