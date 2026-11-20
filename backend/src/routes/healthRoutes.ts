// Health & System API Routes

import { Request, Response, Router } from 'express';

const router = Router();

// GET /health — Service Liveness Endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'NewsLens AI Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// GET /api/v1 — Versioned API Index
router.get('/api/v1', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'NewsLens AI Backend API',
    version: 'v1',
    status: 'available',
    description: 'REST API powering news collection, event clustering, and multi-dimensional framing analysis.',
    documentation: '/docs',
    endpoints: {
      auth: '/api/v1/auth',
      sources: '/api/v1/sources',
      articles: '/api/v1/articles',
      events: '/api/v1/events',
      analyses: '/api/v1/analyses',
      comparisons: '/api/v1/comparisons',
      history: '/api/v1/history',
    },
  });
});

export default router;
