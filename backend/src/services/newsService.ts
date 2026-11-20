// News Domain Service (Sources, Articles, Events) with Prisma & Fallback

import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

// Pre-seeded realistic editorial news sources for immediate testing and mobile feed
export const INITIAL_SOURCES = [
  { id: 'src-1', name: 'BBC News', websiteUrl: 'https://bbc.com/news', rssFeedUrl: 'https://feeds.bbci.co.uk/news/rss.xml', country: 'UK', category: 'General', description: 'British public service broadcaster providing global news coverage.', isActive: true },
  { id: 'src-2', name: 'Reuters', websiteUrl: 'https://reuters.com', rssFeedUrl: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best', country: 'International', category: 'Newswire', description: 'International news organization delivering financial and global wire reporting.', isActive: true },
  { id: 'src-3', name: 'The Guardian', websiteUrl: 'https://theguardian.com', rssFeedUrl: 'https://www.theguardian.com/world/rss', country: 'UK', category: 'Analysis', description: 'Independent progressive editorial daily with analytical investigations.', isActive: true },
  { id: 'src-4', name: 'Associated Press', websiteUrl: 'https://apnews.com', rssFeedUrl: 'https://apnews.com/feed', country: 'USA', category: 'Newswire', description: 'Independent global news cooperative based in the United States.', isActive: true },
  { id: 'src-5', name: 'Financial Times', websiteUrl: 'https://ft.com', rssFeedUrl: 'https://www.ft.com/rss/home', country: 'UK', category: 'Financial', description: 'Global business and financial daily focusing on macroeconomic governance.', isActive: true },
];

export const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Global Climate Summit Adopts New Energy Transition Pact',
    description: 'Delegates from 195 nations reach late-night compromise on renewable energy acceleration and gradual emissions reductions.',
    category: 'Environment & Policy',
    eventDate: new Date('2026-11-20T10:15:00Z'),
    sources: ['Reuters', 'BBC News', 'The Guardian', 'Financial Times'],
  },
  {
    id: 'evt-2',
    title: 'Central Banks Signal Cautious Monetary Easing as Inflation Cools',
    description: 'Policymakers balance employment stability against persistent service-sector price pressures across major economies.',
    category: 'Economy',
    eventDate: new Date('2026-11-20T08:45:00Z'),
    sources: ['Financial Times', 'Reuters', 'Associated Press'],
  },
  {
    id: 'evt-3',
    title: 'New AI Governance Framework Introduced in International Forum',
    description: 'Multi-stakeholder summit debates standardized safety audits and transparency standards for frontier foundation models.',
    category: 'Technology & Governance',
    eventDate: new Date('2026-11-19T18:30:00Z'),
    sources: ['BBC News', 'The Guardian', 'Associated Press'],
  },
];

export const INITIAL_ARTICLES = [
  {
    id: 'art-1',
    sourceId: 'src-2',
    sourceName: 'Reuters',
    eventId: 'evt-1',
    headline: 'Nations Agree Historic Energy Roadmap After Heated Negotiations',
    originalUrl: 'https://reuters.com/world/climate-pact-agreement',
    author: 'David Alistair',
    publishedAt: new Date('2026-11-20T09:30:00Z'),
    summary: 'Fact-focused dispatch highlighting the financial commitments and renewable build-out benchmarks accepted by member delegations.',
    content: 'Delegates approved an updated roadmap accelerating renewable investments while deferring contentious fossil fuel subsidy phaseouts to future sessions. Negotiators cited economic realism and grid resilience requirements.',
  },
  {
    id: 'art-2',
    sourceId: 'src-3',
    sourceName: 'The Guardian',
    eventId: 'evt-1',
    headline: 'Climate Deal Falls Short of Binding Targets Amid Fossil Fuel Lobbying',
    originalUrl: 'https://theguardian.com/environment/summit-verdict',
    author: 'Fiona Campbell',
    publishedAt: new Date('2026-11-20T09:45:00Z'),
    summary: 'Critical analysis examining loophole clauses, vulnerability of developing island states, and civil society protests outside the plenary hall.',
    content: 'While hailed as a diplomatic triumph by host officials, environmental watchdogs warned the absence of binding enforcement mechanisms leaves frontline communities exposed to severe climate disruptions.',
  },
];

export const newsService = {
  // Sources
  getSources: async (filter: { category?: string; country?: string; isActive?: boolean; page: number; limit: number }) => {
    try {
      const where: any = {};
      if (filter.category) where.category = filter.category;
      if (filter.country) where.country = filter.country;
      if (filter.isActive !== undefined) where.isActive = filter.isActive;

      const [sources, total] = await Promise.all([
        prisma.newsSource.findMany({
          where,
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy: { name: 'asc' },
        }),
        prisma.newsSource.count({ where }),
      ]);

      if (sources.length > 0) {
        return { data: sources, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
      }
    } catch (err: any) {
      logger.warn('Prisma query failed in newsService.getSources, using initial source catalog fallback:', err.message);
    }

    // Fallback catalog
    let list = INITIAL_SOURCES;
    if (filter.category) list = list.filter((s) => s.category.toLowerCase() === filter.category!.toLowerCase());
    if (filter.country) list = list.filter((s) => s.country.toLowerCase() === filter.country!.toLowerCase());

    const total = list.length;
    const paginated = list.slice((filter.page - 1) * filter.limit, filter.page * filter.limit);

    return {
      data: paginated,
      pagination: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit) || 1,
      },
    };
  },

  getSourceById: async (id: string) => {
    try {
      const source = await prisma.newsSource.findUnique({ where: { id } });
      if (source) return source;
    } catch (err: any) {
      logger.warn('Prisma query failed in newsService.getSourceById:', err.message);
    }

    const found = INITIAL_SOURCES.find((s) => s.id === id);
    if (!found) throw new AppError('News source not found.', 404);
    return found;
  },

  // Events
  getEvents: async (filter: { category?: string; page: number; limit: number }) => {
    try {
      const where: any = {};
      if (filter.category) where.category = filter.category;

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

      if (events.length > 0) {
        const formatted = events.map((ev) => ({
          id: ev.id,
          title: ev.title,
          summary: ev.description || '',
          topicCategory: ev.category,
          updatedAt: ev.eventDate.toISOString(),
          articleCount: ev.articles.length,
          sourceCount: new Set(ev.articles.map((a) => a.source.name)).size,
          sources: Array.from(new Set(ev.articles.map((a) => a.source.name))),
        }));
        return { data: formatted, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
      }
    } catch (err: any) {
      logger.warn('Prisma query failed in newsService.getEvents, using initial events fallback:', err.message);
    }

    let list = INITIAL_EVENTS;
    if (filter.category) list = list.filter((e) => e.category.toLowerCase().includes(filter.category!.toLowerCase()));

    const total = list.length;
    const paginated = list.slice((filter.page - 1) * filter.limit, filter.page * filter.limit).map((ev) => ({
      id: ev.id,
      title: ev.title,
      summary: ev.description,
      topicCategory: ev.category,
      updatedAt: ev.eventDate.toISOString(),
      articleCount: ev.sources.length * 2,
      sourceCount: ev.sources.length,
      sources: ev.sources,
    }));

    return {
      data: paginated,
      pagination: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit) || 1,
      },
    };
  },

  getEventById: async (id: string) => {
    try {
      const event = await prisma.newsEvent.findUnique({
        where: { id },
        include: { articles: { include: { source: true } } },
      });
      if (event) return event;
    } catch (err: any) {
      logger.warn('Prisma query failed in newsService.getEventById:', err.message);
    }

    const found = INITIAL_EVENTS.find((e) => e.id === id);
    if (!found) throw new AppError('News event not found.', 404);

    return {
      ...found,
      articles: INITIAL_ARTICLES.filter((a) => a.eventId === id),
    };
  },

  // Articles
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

      const [articles, total] = await Promise.all([
        prisma.newsArticle.findMany({
          where,
          include: { source: true },
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          orderBy: { publishedAt: 'desc' },
        }),
        prisma.newsArticle.count({ where }),
      ]);

      if (articles.length > 0) {
        const formatted = articles.map((a) => ({
          id: a.id,
          title: a.headline,
          headline: a.headline,
          originalUrl: a.originalUrl,
          url: a.originalUrl,
          author: a.author || undefined,
          publishedAt: a.publishedAt.toISOString(),
          summary: a.summary || '',
          content: a.content || '',
          sourceId: a.sourceId,
          sourceName: a.source.name,
          category: a.source.category || 'General',
          eventId: a.eventId || undefined,
        }));
        return { data: formatted, pagination: { total, page: filter.page, limit: filter.limit, totalPages: Math.ceil(total / filter.limit) } };
      }
    } catch (err: any) {
      logger.warn('Prisma query failed in newsService.getArticles, using initial articles fallback:', err.message);
    }

    let list = INITIAL_ARTICLES;
    if (filter.sourceId) list = list.filter((a) => a.sourceId === filter.sourceId);
    if (filter.eventId) list = list.filter((a) => a.eventId === filter.eventId);
    if (filter.search) {
      const term = filter.search.toLowerCase();
      list = list.filter((a) => a.headline.toLowerCase().includes(term) || a.summary.toLowerCase().includes(term));
    }

    const total = list.length;
    const paginated = list.slice((filter.page - 1) * filter.limit, filter.page * filter.limit).map((a) => ({
      id: a.id,
      title: a.headline,
      headline: a.headline,
      originalUrl: a.originalUrl,
      url: a.originalUrl,
      author: a.author,
      publishedAt: a.publishedAt.toISOString(),
      summary: a.summary,
      content: a.content,
      sourceId: a.sourceId,
      sourceName: a.sourceName,
      category: 'Environment',
      eventId: a.eventId,
    }));

    return {
      data: paginated,
      pagination: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit) || 1,
      },
    };
  },

  getArticleById: async (id: string) => {
    try {
      const article = await prisma.newsArticle.findUnique({
        where: { id },
        include: { source: true, event: true, analyses: true },
      });
      if (article) return article;
    } catch (err: any) {
      logger.warn('Prisma query failed in newsService.getArticleById:', err.message);
    }

    const found = INITIAL_ARTICLES.find((a) => a.id === id);
    if (!found) throw new AppError('News article not found.', 404);

    return {
      ...found,
      title: found.headline,
      url: found.originalUrl,
      category: 'Environment',
    };
  },
};
