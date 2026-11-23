import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';
import {
  compareArticlesForEvent,
  EVENT_MATCH_WINDOW_HOURS,
  EventMatchEvidence,
  MatchArticle,
} from './eventMatching.js';

const latestFeatures = (article: any) => {
  const analysis = article.analyses?.[0];
  return {
    ...article,
    entities: analysis?.entities ?? undefined,
    topics: analysis?.topics ?? undefined,
  } as MatchArticle;
};

export const eventDetectionService = {
  assignArticle: async (articleId: string, retry = 0): Promise<{
    articleId: string;
    eventId: string | null;
    matched: boolean;
    alreadyAssigned?: boolean;
    candidateCount?: number;
    confidence?: number;
    evidence?: EventMatchEvidence;
  }> => {
    const article = await prisma.newsArticle.findUnique({
      where: { id: articleId },
      include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!article) throw new AppError('News article not found.', 404);
    if (article.eventId) {
      return { articleId, eventId: article.eventId, matched: true, alreadyAssigned: true };
    }

    const windowMs = EVENT_MATCH_WINDOW_HOURS * 60 * 60 * 1000;
    const candidates = await prisma.newsArticle.findMany({
      where: {
        id: { not: articleId },
        publishedAt: {
          gte: new Date(article.publishedAt.getTime() - windowMs),
          lte: new Date(article.publishedAt.getTime() + windowMs),
        },
      },
      include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });

    const ranked = candidates
      .map((candidate) => ({
        candidate,
        evidence: compareArticlesForEvent(latestFeatures(article), latestFeatures(candidate)),
      }))
      .filter((result) => result.evidence.matched)
      .sort((left, right) => right.evidence.score - left.evidence.score);
    const best = ranked[0];
    if (!best) return { articleId, eventId: null, matched: false, candidateCount: candidates.length };

    let eventId: string;
    try {
      eventId = await prisma.$transaction(async (tx) => {
      const current = await tx.newsArticle.findUnique({ where: { id: articleId }, select: { eventId: true } });
      if (current?.eventId) return current.eventId;

      const matchingCandidate = await tx.newsArticle.findUnique({
        where: { id: best.candidate.id },
        select: { eventId: true },
      });
      let targetEventId = matchingCandidate?.eventId ?? null;
      if (!targetEventId) {
        const event = await tx.newsEvent.create({
          data: {
            title: best.candidate.headline,
            description: `Related coverage grouped using lexical and date-based signals. Representative article: ${best.candidate.headline}`,
            category: (latestFeatures(article).topics as any[])?.[0]?.topic ?? 'General',
            eventDate: article.publishedAt,
          },
          select: { id: true },
        });
        targetEventId = event.id;
        const candidateClaim = await tx.newsArticle.updateMany({
          where: { id: best.candidate.id, eventId: null },
          data: { eventId: targetEventId },
        });
        if (candidateClaim.count !== 1) {
          throw new AppError('Matching article event assignment changed concurrently; retry detection.', 409);
        }
      }

      const updates = await tx.newsArticle.updateMany({
        where: { id: articleId, eventId: null },
        data: { eventId: targetEventId },
      });
      if (updates.count === 0) {
        const latest = await tx.newsArticle.findUnique({ where: { id: articleId }, select: { eventId: true } });
        if (latest?.eventId) return latest.eventId;
        throw new AppError('Article event assignment changed concurrently; retry detection.', 409);
      }

      return targetEventId;
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 409 && retry < 2) {
        return eventDetectionService.assignArticle(articleId, retry + 1);
      }
      throw error;
    }

    return {
      articleId,
      eventId,
      matched: true,
      alreadyAssigned: false,
      confidence: best.evidence.score,
      evidence: best.evidence,
    };
  },

  detectPendingArticles: async (limit = 100) => {
    const articles = await prisma.newsArticle.findMany({
      where: { eventId: null },
      select: { id: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    const results = [];
    for (const article of articles) results.push(await eventDetectionService.assignArticle(article.id));
    return {
      scanned: results.length,
      matched: results.filter((result) => result.matched).length,
      unmatched: results.filter((result) => !result.matched).length,
      results,
    };
  },

  getEventArticles: async (eventId: string, page: number, limit: number) => {
    const event = await prisma.newsEvent.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) throw new AppError('News event not found.', 404);
    const where = { eventId };
    const [data, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: { source: true, analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.newsArticle.count({ where }),
    ]);
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  },
};
