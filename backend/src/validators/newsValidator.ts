// Zod Validation Schemas for News Sources, Articles, Events, and Collection

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

export const createSourceSchema = z.object({
  name: z.string().min(2, 'Source name must be at least 2 characters'),
  websiteUrl: z.string().url('Must be a valid website URL'),
  rssFeedUrl: z.string().url('Must be a valid RSS feed URL').optional(),
  description: z.string().optional(),
  country: z.string().optional().default('International'),
  category: z.string().optional().default('General'),
  isActive: z.boolean().optional().default(true),
});

export const updateSourceSchema = z.object({
  name: z.string().min(2).optional(),
  websiteUrl: z.string().url().optional(),
  rssFeedUrl: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  country: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const articleFilterSchema = paginationQuerySchema.extend({
  sourceId: z.string().optional(),
  eventId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional().refine((v) => !v || !isNaN(Date.parse(v)), {
    message: 'Invalid startDate format. Use ISO date string.',
  }),
  endDate: z.string().optional().refine((v) => !v || !isNaN(Date.parse(v)), {
    message: 'Invalid endDate format. Use ISO date string.',
  }),
  sortBy: z.enum(['publishedAt', 'createdAt', 'headline']).optional().default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
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

export const validateFeedInputSchema = z.object({
  feedUrl: z.string().url('Must provide a valid RSS/Atom feed URL'),
});
