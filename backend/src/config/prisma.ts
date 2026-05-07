import { PrismaClient } from '@prisma/client';
import { env } from './env';

console.log('[PRISMA] Initializing PrismaClient...');
console.log('[PRISMA] DATABASE_URL is', process.env.DATABASE_URL ? 'set' : 'NOT SET');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log:
        env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

  if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
  
  console.log('[PRISMA] ✅ PrismaClient created successfully');
} catch (err) {
  console.error('[PRISMA] ❌ Failed to create PrismaClient:', err);
  throw err;
}

export const prisma = prismaInstance;
export default prisma;
