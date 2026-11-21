import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { analysisService } from '../services/analysisService.js';
import { paginationQuerySchema } from '../validators/newsValidator.js';

export const historyController = {
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await analysisService.getHistory(req.user!.userId, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  },
};
