// Health & System API Endpoint Tests

import request from 'supertest';
import { createApp } from '../src/app';

describe('System Health & Root Endpoints', () => {
  const app = createApp();

  it('GET /health should return 200 with service information', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('NewsLens AI Backend');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1 should return 200 with available endpoints dictionary', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('v1');
    expect(res.body.status).toBe('available');
    expect(res.body.endpoints).toBeDefined();
    expect(res.body.endpoints.auth).toBe('/api/v1/auth');
  });

  it('GET /unknown-route should return 404 with structured error', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
