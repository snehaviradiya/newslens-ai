// News Articles Controller

import { NextFunction, Request, Response } from 'express';
import { newsService } from '../services/newsService.js';
import { articleFilterSchema, idParamSchema, analyzeArticleInputSchema } from '../validators/newsValidator.js';

export const articleController = {
  // GET /api/v1/articles
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = articleFilterSchema.parse(req.query);
      const result = await newsService.getArticles(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/articles/:id
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const article = await newsService.getArticleById(id);

      res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/articles/analyze
  analyzeArticle: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = analyzeArticleInputSchema.parse(req.body);

      // Return structured framing evaluation
      // Note: Live model pipeline scheduled for Day 5 (23 Nov)
      const simulatedAnalysis = {
        id: `ana-${Date.now()}`,
        articleId: 'art-custom',
        articleTitle: payload.url
          ? `Analysis of ${payload.url.replace(/^https?:\/\//, '').slice(0, 45)}...`
          : 'Submitted Article Text Analysis',
        sourceName: payload.url?.includes('reuters') ? 'Reuters' : payload.url?.includes('guardian') ? 'The Guardian' : 'Independent Source',
        analyzedAt: new Date().toISOString(),
        headlineSentiment: 0.12,
        headlineSensationalism: 0.18,
        overallTone: 'Neutral',
        subjectivityScore: 0.28,
        framingScores: {
          conflict: 0.35,
          economic: 0.68,
          humanInterest: 0.22,
          morality: 0.15,
          responsibility: 0.48,
        },
        entities: [
          { name: 'Regulatory Authority', type: 'ORG', mentionCount: 3, stance: 'Neutral' },
        ],
        quotes: [
          { speaker: 'Policy Representative', quote: 'Implementation standards remain under evaluation.' },
        ],
        supportingEvidence: [
          { frame: 'economic', excerpt: 'Capital expenditure requirements were estimated at $450M.' },
        ],
        isDemo: true,
      };

      res.status(200).json({
        success: true,
        message: 'Article framing analysis processed.',
        data: simulatedAnalysis,
      });
    } catch (error) {
      next(error);
    }
  },
};
