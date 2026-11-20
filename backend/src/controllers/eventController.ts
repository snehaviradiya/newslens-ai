// News Events Controller

import { NextFunction, Request, Response } from 'express';
import { newsService } from '../services/newsService.js';
import { eventFilterSchema, idParamSchema } from '../validators/newsValidator.js';

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
};
