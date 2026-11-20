// News Sources, Articles & Events API Tests

import request from 'supertest';
import { createApp } from '../src/app';

describe('News Domain API Endpoints (/api/v1)', () => {
  const app = createApp();

  describe('GET /api/v1/sources', () => {
    it('should return a paginated list of news sources', async () => {
      const res = await request(app).get('/api/v1/sources?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
    });

    it('should retrieve single news source by ID', async () => {
      const res = await request(app).get('/api/v1/sources/src-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('BBC News');
    });

    it('should return 404 for unknown source ID', async () => {
      const res = await request(app).get('/api/v1/sources/non-existent-source');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/events', () => {
    it('should return paginated clustered news events', async () => {
      const res = await request(app).get('/api/v1/events?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].sourceCount).toBeGreaterThan(0);
      expect(res.body.data[0].sources).toBeDefined();
    });

    it('should retrieve single event cluster by ID', async () => {
      const res = await request(app).get('/api/v1/events/evt-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('evt-1');
    });
  });

  describe('GET /api/v1/articles', () => {
    it('should return paginated news articles with source attribution', async () => {
      const res = await request(app).get('/api/v1/articles?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].sourceName).toBeDefined();
    });

    it('should retrieve single article by ID', async () => {
      const res = await request(app).get('/api/v1/articles/art-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('art-1');
    });

    it('POST /api/v1/articles/analyze should accept article URL and return framing analysis', async () => {
      const res = await request(app)
        .post('/api/v1/articles/analyze')
        .send({ url: 'https://reuters.com/world/climate-pact-agreement' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.framingScores).toBeDefined();
      expect(res.body.data.framingScores.economic).toBeGreaterThan(0);
    });

    it('POST /api/v1/articles/analyze should reject empty payload with 400', async () => {
      const res = await request(app)
        .post('/api/v1/articles/analyze')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
