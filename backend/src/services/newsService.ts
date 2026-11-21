// Database-backed news domain service with advanced filtering and source management

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
          include: {
            _count: {
              select: { articles: true },
            },
          },
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy: { name: 'asc' },
        }),
        prisma.newsSource.count({ where }),
      ]);

      const formatted = data.map((source: any) => ({
        id: source.id,
        name: source.name,
        websiteUrl: source.websiteUrl,
        rssFeedUrl: source.rssFeedUrl,
        description: source.description,
        country: source.country,
        category: source.category,
        isActive: source.isActive,
        articleCount: source._count?.articles ?? 0,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
      }));

      return { data: formatted, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
    } catch (error) {
      return databaseError(error);
    }
  },

  getSourceById: async (id: string) => {
    try {
      const source = await prisma.newsSource.findUnique({
        where: { id },
        include: {
          _count: {
            select: { articles: true },
          },
        },
      });
      if (!source) throw new AppError('News source not found.', 404);
      return {
        ...source,
        articleCount: (source as any)._count?.articles ?? 0,
      };
    } catch (error) {
      return databaseError(error);
    }
  },

  createSource: async (data: {
    name: string;
    websiteUrl: string;
    rssFeedUrl?: string;
    description?: string;
    country?: string;
    category?: string;
    isActive?: boolean;
  }) => {
    try {
      const existing = await prisma.newsSource.findUnique({
        where: { websiteUrl: data.websiteUrl },
      });
      if (existing) {
        throw new AppError('A news source with this website URL already exists.', 409);
      }

      const created = await prisma.newsSource.create({
        data: {
          name: data.name,
          websiteUrl: data.websiteUrl,
          rssFeedUrl: data.rssFeedUrl,
          description: data.description,
          country: data.country || 'International',
          category: data.category || 'General',
          isActive: data.isActive ?? true,
        },
      });
      return created;
    } catch (error) {
      return databaseError(error);
    }
  },

  updateSource: async (
    id: string,
    data: {
      name?: string;
      websiteUrl?: string;
      rssFeedUrl?: string | null;
      description?: string | null;
      country?: string;
      category?: string;
      isActive?: boolean;
    }
  ) => {
    try {
      const source = await prisma.newsSource.findUnique({ where: { id } });
      if (!source) throw new AppError('News source not found.', 404);

      if (data.websiteUrl && data.websiteUrl !== source.websiteUrl) {
        const existing = await prisma.newsSource.findUnique({ where: { websiteUrl: data.websiteUrl } });
        if (existing) throw new AppError('A news source with this website URL already exists.', 409);
      }

      const updated = await prisma.newsSource.update({
        where: { id },
        data,
      });
      return updated;
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

  getArticles: async (filter: {
    sourceId?: string;
    eventId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'publishedAt' | 'createdAt' | 'headline';
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) => {
    try {
      const where: any = {};
      if (filter.sourceId) where.sourceId = filter.sourceId;
      if (filter.eventId) where.eventId = filter.eventId;

      if (filter.startDate || filter.endDate) {
        where.publishedAt = {};
        if (filter.startDate) where.publishedAt.gte = new Date(filter.startDate);
        if (filter.endDate) where.publishedAt.lte = new Date(filter.endDate);
      }

      if (filter.search) {
        where.OR = [
          { headline: { contains: filter.search, mode: 'insensitive' } },
          { summary: { contains: filter.search, mode: 'insensitive' } },
          { content: { contains: filter.search, mode: 'insensitive' } },
          { author: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      const sortField = filter.sortBy || 'publishedAt';
      const sortOrder = filter.sortOrder || 'desc';
      orderBy[sortField] = sortOrder;

      const [data, total] = await Promise.all([
        prisma.newsArticle.findMany({
          where,
          include: { source: true },
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy,
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
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));

      return {
        data: formatted,
        pagination: {
          total,
          page: filter.page,
          limit: filter.limit,
          totalPages: Math.ceil(total / filter.limit),
        },
      };
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
      return {
        ...article,
        title: article.headline,
        url: article.originalUrl,
        sourceName: article.source?.name,
      };
    } catch (error) {
      return databaseError(error);
    }
  },
};
