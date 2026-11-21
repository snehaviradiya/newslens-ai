// Database-backed news domain service

import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';

const databaseError = (error: unknown): never => {
  if (error instanceof AppError) throw error;
  throw new AppError('Database unavailable. Configure PostgreSQL and apply migrations.', 503);
};

export const newsService = {
  getSources: async (filter: { category?: string; country?: string; isActive?: boolean; page: number; limit: number }) => {
    try {
      const where: any = {};
      if (filter.category) where.category = filter.category;
      if (filter.country) where.country = filter.country;
      if (filter.isActive !== undefined) where.isActive = filter.isActive;
      const [data, total] = await Promise.all([
        prisma.newsSource.findMany({
          where,
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy: { name: 'asc' },
        }),
        prisma.newsSource.count({ where }),
      ]);
      return { data, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
    } catch (error) {
      return databaseError(error);
    }
  },

  getSourceById: async (id: string) => {
    try {
      const source = await prisma.newsSource.findUnique({ where: { id } });
      if (!source) throw new AppError('News source not found.', 404);
      return source;
    } catch (error) {
      return databaseError(error);
    }
  },

  getEvents: async (filter: { category?: string; page: number; limit: number }) => {
    try {
      const where: any = filter.category ? { category: filter.category } : {};
      const [events, total] = await Promise.all([
        prisma.newsEvent.findMany({
          where,
          include: { articles: { include: { source: true } } },
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy: { eventDate: 'desc' },
        }),
        prisma.newsEvent.count({ where }),
      ]);
      const data = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        eventDate: event.eventDate,
        articleCount: event.articles.length,
        sourceCount: new Set(event.articles.map((article) => article.sourceId)).size,
        sources: Array.from(new Set(event.articles.map((article) => article.source.name))),
      }));
      return { data, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
    } catch (error) {
      return databaseError(error);
    }
  },

  getEventById: async (id: string) => {
    try {
      const event = await prisma.newsEvent.findUnique({
        where: { id },
        include: { articles: { include: { source: true } } },
      });
      if (!event) throw new AppError('News event not found.', 404);
      return event;
    } catch (error) {
      return databaseError(error);
    }
  },

  getArticles: async (filter: { sourceId?: string; eventId?: string; search?: string; page: number; limit: number }) => {
    try {
      const where: any = {};
      if (filter.sourceId) where.sourceId = filter.sourceId;
      if (filter.eventId) where.eventId = filter.eventId;
      if (filter.search) {
        where.OR = [
          { headline: { contains: filter.search, mode: 'insensitive' } },
          { summary: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
      const [data, total] = await Promise.all([
        prisma.newsArticle.findMany({
          where,
          include: { source: true },
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy: { publishedAt: 'desc' },
        }),
        prisma.newsArticle.count({ where }),
      ]);
      const formatted = data.map((article: any) => ({
        id: article.id,
        headline: article.headline,
        title: article.headline,
        originalUrl: article.originalUrl,
        url: article.originalUrl,
        author: article.author,
        publishedAt: article.publishedAt,
        summary: article.summary,
        content: article.content,
        sourceId: article.sourceId,
        sourceName: article.source?.name,
        eventId: article.eventId,
      }));
      return { data: formatted, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
    } catch (error) {
      return databaseError(error);
    }
  },

  getArticleById: async (id: string) => {
    try {
      const article = await prisma.newsArticle.findUnique({
        where: { id },
        include: { source: true, event: true, analyses: true },
      });
      if (!article) throw new AppError('News article not found.', 404);
      return article;
    } catch (error) {
      return databaseError(error);
    }
  },
};
