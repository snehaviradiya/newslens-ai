// Environment Configuration & Zod Validation

import dotenv from 'dotenv';
import { z } from 'zod';

// Load local .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().default('newslens-super-secret-jwt-key-2026-academic-research'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/newslens?schema=public'),
  AI_ENGINE_URL: z.string().default('http://localhost:8000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
