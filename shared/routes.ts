import { z } from 'zod';
import { insertLeadSchema, insertTweetSchema, insertGeneratedContentSchema, leads, tweets, generatedContent } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalLeads: z.number(),
          contacted: z.number(),
          replies: z.number(),
          conversions: z.number(),
          ctrAverage: z.number(),
        }),
      },
    },
  },
  tweets: {
    monitor: {
      method: 'POST' as const,
      path: '/api/tweets/monitor', // Trigger monitoring/fetching
      input: z.object({
        offer: z.string(), // The offer to score relevance against
      }),
      responses: {
        200: z.array(z.custom<typeof tweets.$inferSelect>()), // Returns new tweets found
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/tweets',
      responses: {
        200: z.array(z.custom<typeof tweets.$inferSelect>()),
      },
    },
  },
  content: {
    generate: {
      method: 'POST' as const,
      path: '/api/content/generate',
      input: z.object({
        topic: z.string(),
        niche: z.string(),
        count: z.number().default(3),
      }),
      responses: {
        200: z.array(z.custom<typeof generatedContent.$inferSelect>()),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/content',
      responses: {
        200: z.array(z.custom<typeof generatedContent.$inferSelect>()),
      },
    },
  },
  leads: {
    list: {
      method: 'GET' as const,
      path: '/api/leads',
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leads',
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/leads/:id',
      input: insertLeadSchema.partial(),
      responses: {
        200: z.custom<typeof leads.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
