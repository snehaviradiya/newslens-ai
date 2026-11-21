// Environment Configuration & Zod Validation

import dotenv from 'dotenv';
import { z } from 'zod';

// Load local .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:8081,http://localhost:19006'),
  JWT_SECRET: z.string().default(
    process.env.NODE_ENV === 'test'
      ? 'test-only-secret-at-least-32-characters'
      : 'development-only-secret-change-before-production'
  ),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().optional(),
  AI_ENGINE_URL: z.string().default('http://localhost:8000'),
  ENABLE_COLLECTION_SCHEDULER: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  COLLECTION_INTERVAL_MINUTES: z
    .string()
    .optional()
    .default('60')
    .transform((val) => parseInt(val, 10) || 60),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

if (
  env.NODE_ENV === 'production' &&
  (env.JWT_SECRET.length < 32 || env.JWT_SECRET.startsWith('development-only'))
) {
  console.error('JWT_SECRET must be configured with at least 32 characters in production.');
  process.exit(1);
}
