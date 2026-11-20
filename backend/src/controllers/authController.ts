// Authentication Controller

import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { authService } from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

export const authController = {
  // POST /api/v1/auth/register
  register: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/login
  login: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/auth/me
  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};
