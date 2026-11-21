import request from 'supertest';
import { createApp } from '../src/app';
import { signToken } from '../src/utils/jwt.js';

jest.mock('../src/utils/prisma.js', () => ({
  prisma: {
    articleAnalysis: {
      findMany: jest.fn(async () => []),
      count: jest.fn(async () => 0),
      findUnique: jest.fn(async () => null),
    },
    articleComparison: {
      findMany: jest.fn(async () => []),
      count: jest.fn(async () => 0),
      findUnique: jest.fn(async () => null),
    },
    analysisHistory: {
      findMany: jest.fn(async () => []),
      count: jest.fn(async () => 0),
    },
  },
}));

describe('Analysis, comparison, and history endpoints', () => {
  const app = createApp();

  it('returns a paginated empty analyses list', async () => {
    const res = await request(app).get('/api/v1/analyses?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns 404 for an unknown analysis', async () => {
    const res = await request(app).get('/api/v1/analyses/missing');
    expect(res.status).toBe(404);
  });

  it('returns a paginated empty comparisons list', async () => {
    const res = await request(app).get('/api/v1/comparisons');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('protects history and returns only the authenticated user collection', async () => {
    const unauthorized = await request(app).get('/api/v1/history');
    expect(unauthorized.status).toBe(401);

    const token = signToken({ userId: 'usr-1', email: 'user@example.com', role: 'USER' });
    const authorized = await request(app)
      .get('/api/v1/history')
      .set('Authorization', `Bearer ${token}`);
    expect(authorized.status).toBe(200);
    expect(authorized.body.data).toEqual([]);
  });
});
