import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { cacheService } from './config/cache';
import { prisma } from './config/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import categoryRoutes from './modules/categories/categories.routes';
import productRoutes from './modules/products/products.routes';
import orderRoutes from './modules/orders/orders.routes';
import reviewRoutes from './modules/reviews/reviews.routes';

export const createApp = (): Express => {
  const app = express();

  // ─── Security middleware ──────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Rate limiting ────────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ─── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Logging ──────────────────────────────────────────────────────────────
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use(requestLogger);

  // ─── API documentation ─────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  }

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      cache: cacheService.isConnected() ? 'connected' : 'disabled',
    });
  });

  // ─── API routes ───────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);

  // ─── 404 & error handlers ─────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

// Bootstrap function
const bootstrap = async (): Promise<void> => {
  try {
    logger.info('Starting bootstrap...');

    // Connect to Redis (optional – failures are non-fatal)
    if (env.REDIS_URL) {
      logger.info('Connecting to Redis...');
      await cacheService.connect(env.REDIS_URL);
      logger.info('✅ Redis connected');
    } else {
      logger.info('REDIS_URL not configured – caching disabled');
    }

    // Verify database connection
    logger.info('Verifying database connection...');
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected');

    const app = createApp();

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      if (env.NODE_ENV !== 'production') {
        logger.info(`📚 API docs: http://localhost:${env.PORT}/api-docs`);
      }
    });

    server.on('error', (err) => {
      logger.error('Server error:', err);
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      await cacheService.disconnect();
      await prisma.$disconnect();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Bootstrap failed:', err);
    throw err;
  }
};

// Only start the server when this file is the direct entry point.
// Prevents the server binding when main.ts is imported by tests.
if (require.main === module) {
  bootstrap().catch((err) => {
    logger.error('Fatal error during bootstrap:', err);
    process.exit(1);
  });
}
