// Zod Validation Schemas for News Sources, Articles, and Events

import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.string().optional().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z.string().optional().default('10').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 10))),
});

export const sourceFilterSchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  country: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
});

export const articleFilterSchema = paginationQuerySchema.extend({
  sourceId: z.string().optional(),
  eventId: z.string().optional(),
  search: z.string().optional(),
});

export const eventFilterSchema = paginationQuerySchema.extend({
  category: z.string().optional(),
});

export const analyzeArticleInputSchema = z.object({
  url: z.string().url('Must provide a valid article web URL').optional(),
  text: z.string().min(20, 'Article text must be at least 20 characters').optional(),
}).refine((data) => data.url || data.text, {
  message: 'Either an article web URL or article text must be provided.',
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'Resource identifier is required'),
});
