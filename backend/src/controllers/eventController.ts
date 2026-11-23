// News Events Controller

import { NextFunction, Request, Response } from 'express';
import { newsService } from '../services/newsService.js';
import { compareEventSchema, detectEventsSchema, eventFilterSchema, idParamSchema, paginationQuerySchema } from '../validators/newsValidator.js';
import { eventDetectionService } from '../services/eventDetectionService.js';
import { comparisonGenerationService } from '../services/comparisonGenerationService.js';

export const eventController = {
  // GET /api/v1/events
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = eventFilterSchema.parse(req.query);
      const result = await newsService.getEvents(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/events/:id
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const event = await newsService.getEventById(id);

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  getArticles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await eventDetectionService.getEventArticles(id, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  },

  detect: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = detectEventsSchema.parse(req.body ?? {});
      const result = input.articleId
        ? await eventDetectionService.assignArticle(input.articleId)
        : await eventDetectionService.detectPendingArticles(input.limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  compare: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = compareEventSchema.parse(req.body ?? {});
      const data = await comparisonGenerationService.compareEvent(id, input.articleIds);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
