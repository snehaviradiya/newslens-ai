// News Sources, Articles & Events API Tests

import request from 'supertest';
import { createApp } from '../src/app';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/utils/prisma.js', () => {
  const sources = [{
    id: 'src-1', name: 'BBC News', websiteUrl: 'https://bbc.com/news',
    rssFeedUrl: 'https://feeds.bbci.co.uk/news/rss.xml', description: 'Public service broadcaster',
    country: 'UK', category: 'General', isActive: true, createdAt: new Date(), updatedAt: new Date(),
  }];
  const articles = [{
    id: 'art-1', headline: 'Climate agreement', originalUrl: 'https://example.com/article',
    author: 'Test Author', content: 'Test content', summary: 'Test summary',
    publishedAt: new Date(), sourceId: 'src-1', eventId: 'evt-1',
    createdAt: new Date(), updatedAt: new Date(), source: sources[0], event: null, analyses: [],
  }];
  const events = [{
    id: 'evt-1', title: 'Climate Summit', description: 'Test event',
    category: 'Environment', eventDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
    articles: [{ ...articles[0], source: sources[0] }],
  }];

  return {
    prisma: {
      newsSource: {
        findMany: jest.fn(async () => sources),
        count: jest.fn(async () => sources.length),
        findUnique: jest.fn(async ({ where }: any) =>
          sources.find((source) => source.id === where.id) || null),
      },
      newsEvent: {
        findMany: jest.fn(async () => events),
        count: jest.fn(async () => events.length),
        findUnique: jest.fn(async ({ where }: any) =>
          events.find((event) => event.id === where.id) || null),
      },
      newsArticle: {
        findMany: jest.fn(async () => articles),
        count: jest.fn(async () => articles.length),
        findUnique: jest.fn(async ({ where }: any) =>
          articles.find((article) => article.id === where.id) || null),
      },
    },
  };
});

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

    it('returns paginated member articles for an event', async () => {
      const res = await request(app).get('/api/v1/events/evt-1/articles?page=2&limit=3');
      expect(res.status).toBe(200);
      expect(res.body.pagination).toMatchObject({ page: 2, limit: 3, total: 1 });
    });

    it('returns 404 when requesting articles for an unknown event', async () => {
      const res = await request(app).get('/api/v1/events/missing-event/articles');
      expect(res.status).toBe(404);
    });

    it('protects event detection and requires researcher/admin role', async () => {
      const anonymous = await request(app).post('/api/v1/events/detect').send({});
      expect(anonymous.status).toBe(401);

      const token = signToken({ userId: 'user-1', email: 'user@example.com', role: 'USER' });
      const regularUser = await request(app).post('/api/v1/events/detect')
        .set('Authorization', `Bearer ${token}`).send({});
      expect(regularUser.status).toBe(403);
    });

    it('requires sign-in to persist an article analysis', async () => {
      const response = await request(app).post('/api/v1/articles/art-1/analyze');
      expect(response.status).toBe(401);
    });

    it('requires sign-in to run a stored-article batch analysis', async () => {
      const response = await request(app).post('/api/v1/articles/analyze/batch').send({ articleIds: ['art-1'] });
      expect(response.status).toBe(401);
    });

    it('rejects duplicate IDs in an authenticated analysis batch', async () => {
      const token = signToken({ userId: 'user-1', email: 'user@example.com', role: 'USER' });
      const response = await request(app).post('/api/v1/articles/analyze/batch')
        .set('Authorization', `Bearer ${token}`).send({ articleIds: ['art-1', 'art-1'] });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('requires sign-in to create a comparison history record', async () => {
      const response = await request(app).post('/api/v1/events/evt-1/compare').send({});
      expect(response.status).toBe(401);
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

    it('POST /api/v1/articles/analyze should clearly reject URL-only input', async () => {
      const res = await request(app)
        .post('/api/v1/articles/analyze')
        .send({ url: 'https://reuters.com/world/climate-pact-agreement' });

      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_IMPLEMENTED');
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
