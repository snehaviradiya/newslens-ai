import { NextFunction, Request, Response } from 'express';
import { analysisService } from '../services/analysisService.js';
import { idParamSchema, paginationQuerySchema } from '../validators/newsValidator.js';

export const comparisonController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await analysisService.getComparisons(page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = await analysisService.getComparisonById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
