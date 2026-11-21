// Express Application Configuration with Security Middleware

import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import comparisonRoutes from './routes/comparisonRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Root & Health Routes
  app.use('/', healthRoutes);

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/sources', sourceRoutes);
  app.use('/api/v1/articles', articleRoutes);
  app.use('/api/v1/events', eventRoutes);
  app.use('/api/v1/analyses', analysisRoutes);
  app.use('/api/v1/comparisons', comparisonRoutes);
  app.use('/api/v1/history', historyRoutes);
  app.use('/api/v1/collection', collectionRoutes);

  // 404 Route Catch-All
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found on NewsLens AI API.`,
      },
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
