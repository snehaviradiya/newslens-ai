// Collection Pipeline Controller

import { NextFunction, Request, Response } from 'express';
import { newsIngestionService } from '../services/newsIngestionService.js';

export const collectionController = {
  // POST /api/v1/collection/run (Protected: Researcher or Admin)
  run: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await newsIngestionService.runCollection();
      res.status(200).json({
        success: true,
        message: 'News collection pipeline completed successfully.',
        data: summary,
      });
    } catch (error: any) {
      if (error.message && error.message.includes('already running')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'COLLECTION_CONFLICT',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  },

  // GET /api/v1/collection/status
  getStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = newsIngestionService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  },
};
