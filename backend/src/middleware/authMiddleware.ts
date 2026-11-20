// Authentication & Role Authorization Middleware

import { NextFunction, Request, Response } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required in Authorization header.',
      },
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please log in again.',
        },
      });
      return;
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid authentication token provided.',
      },
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: `Insufficient permissions. Requires one of: [${allowedRoles.join(', ')}]`,
        },
      });
      return;
    }

    next();
  };
};
