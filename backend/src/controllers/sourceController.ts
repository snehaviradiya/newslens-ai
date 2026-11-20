// News Sources Controller

import { NextFunction, Request, Response } from 'express';
import { newsService } from '../services/newsService.js';
import { sourceFilterSchema, idParamSchema } from '../validators/newsValidator.js';

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
};
