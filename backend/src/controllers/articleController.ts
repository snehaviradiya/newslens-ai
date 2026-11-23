// News Articles Controller

import { NextFunction, Request, Response } from 'express';
import { newsService } from '../services/newsService.js';
import { analysisService } from '../services/analysisService.js';
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
      const input = analyzeArticleInputSchema.parse(req.body);
      if (!input.text) {
        res.status(501).json({
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'URL-only article ingestion is not yet implemented. Provide article text and an optional headline.',
          },
        });
        return;
      }

      const headline = input.headline || input.text.split(/\s+/).slice(0, 12).join(' ');
      const data = await analysisService.analyzeText(headline, input.text);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
