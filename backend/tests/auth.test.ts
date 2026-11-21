// Authentication Integration & Unit Tests

import request from 'supertest';
import { createApp } from '../src/app';

const mockUsers = new Map<string, any>();

jest.mock('../src/utils/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.email) return mockUsers.get(where.email) || null;
        return Array.from(mockUsers.values()).find((user) => user.id === where.id) || null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const user = {
          id: `usr-${mockUsers.size + 1}`,
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          createdAt: new Date(),
        };
        mockUsers.set(user.email, user);
        return user;
      }),
    },
  },
}));

describe('Authentication API Endpoints (/api/v1/auth)', () => {
  const app = createApp();
  const testUser = {
    name: 'Academic Researcher',
    email: 'researcher@newslens.ai',
    password: 'securePassword123',
    role: 'RESEARCHER',
  };

  let authToken = '';

  it('POST /api/v1/auth/register should register a user and return token + sanitized user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Security: never expose hash
    expect(res.body.data.user.id).toBeDefined();

    authToken = res.body.data.token;
  });

  it('POST /api/v1/auth/register should reject duplicate email registrations with 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/already exists/i);
  });

  it('POST /api/v1/auth/register should fail with 400 on invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.email).toBeDefined();
  });

  it('POST /api/v1/auth/login should authenticate valid user credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/login should reject incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongPassword999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should return current user when valid Bearer token provided', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('GET /api/v1/auth/me should reject requests missing Authorization header with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/auth/me should reject requests with invalid token with 403', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-sample');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
