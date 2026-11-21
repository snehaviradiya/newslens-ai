// News Sources Controller with Validation & Management

import { NextFunction, Request, Response } from 'express';
import { newsService } from '../services/newsService.js';
import { rssParser } from '../services/rssParserService.js';
import {
  sourceFilterSchema,
  idParamSchema,
  createSourceSchema,
  updateSourceSchema,
  validateFeedInputSchema,
} from '../validators/newsValidator.js';

export const sourceController = {
  // GET /api/v1/sources
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = sourceFilterSchema.parse(req.query);
      const result = await newsService.getSources(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/sources/:id
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const source = await newsService.getSourceById(id);

      res.status(200).json({
        success: true,
        data: source,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/sources (Protected: Researcher/Admin)
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = createSourceSchema.parse(req.body);
      const created = await newsService.createSource(body);

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/sources/:id (Protected: Researcher/Admin)
  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const body = updateSourceSchema.parse(req.body);
      const updated = await newsService.updateSource(id, body);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/sources/validate-feed
  validateFeed: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { feedUrl } = validateFeedInputSchema.parse(req.body);
      const validation = await rssParser.validateFeedUrl(feedUrl);

      res.status(200).json({
        success: true,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  },
};
