// Prisma Client Singleton with Connection Management & Error Logging

import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('PostgreSQL connection established successfully via Prisma.');
    return true;
  } catch (error: any) {
    logger.warn('PostgreSQL database currently unreachable or credentials required. Running in standalone fallback mode.', error.message);
    return false;
  }
};
