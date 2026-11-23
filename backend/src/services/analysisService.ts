import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';

export const analysisService = {
  analyzeText: async (headline: string, text: string, sourceName = 'NewsLens Backend') => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_ENGINE_TIMEOUT_MS);

    try {
      const response = await fetch(`${env.AI_ENGINE_URL.replace(/\/$/, '')}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          content: text,
          sourceName,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new AppError(
          `AI analysis service returned ${response.status}. ${body.slice(0, 300)}`,
          response.status === 422 ? 422 : 502
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'AI analysis service is unavailable. Start the FastAPI engine or configure AI_ENGINE_URL.',
        503
      );
    } finally {
      clearTimeout(timeout);
    }
  },
  getAnalyses: async (page: number, limit: number) => {
    try {
      const [data, total] = await Promise.all([
        prisma.articleAnalysis.findMany({
          include: { article: { include: { source: true } } },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.articleAnalysis.count(),
      ]);
      return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    } catch {
      throw new AppError('Database unavailable. Configure PostgreSQL and apply migrations.', 503);
    }
  },

  getAnalysisById: async (id: string) => {
    try {
      const analysis = await prisma.articleAnalysis.findUnique({
        where: { id },
        include: { article: { include: { source: true, event: true } } },
      });
      if (!analysis) throw new AppError('Analysis not found.', 404);
      return analysis;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Database unavailable. Configure PostgreSQL and apply migrations.', 503);
    }
  },

  getComparisons: async (page: number, limit: number) => {
    try {
      const [data, total] = await Promise.all([
        prisma.articleComparison.findMany({
          include: { articleA: { include: { source: true } }, articleB: { include: { source: true } }, event: true },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.articleComparison.count(),
      ]);
      return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    } catch {
      throw new AppError('Database unavailable. Configure PostgreSQL and apply migrations.', 503);
    }
  },

  getComparisonById: async (id: string) => {
    try {
      const comparison = await prisma.articleComparison.findUnique({
        where: { id },
        include: { articleA: { include: { source: true } }, articleB: { include: { source: true } }, event: true },
      });
      if (!comparison) throw new AppError('Comparison not found.', 404);
      return comparison;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Database unavailable. Configure PostgreSQL and apply migrations.', 503);
    }
  },

  getHistory: async (userId: string, page: number, limit: number) => {
    try {
      const where = { userId };
      const [data, total] = await Promise.all([
        prisma.analysisHistory.findMany({
          where,
          include: { article: true, comparison: true },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.analysisHistory.count({ where }),
      ]);
      return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    } catch {
      throw new AppError('Database unavailable. Configure PostgreSQL and apply migrations.', 503);
    }
  },
};
