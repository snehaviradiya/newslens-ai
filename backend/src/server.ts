// HTTP Server Listener

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`NewsLens AI Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`Health check available at http://localhost:${env.PORT}/health`);
  logger.info(`API v1 root available at http://localhost:${env.PORT}/api/v1`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
