import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database connection test
export const connectDatabase = async () => {
  try {
    logger.info('Attempting to connect to database...', {
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    });
    
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('Database query test successful');
    
  } catch (error) {
    console.error('Database connection error details:', error);
    logger.error('Failed to connect to database', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      syscall: (error as any)?.syscall,
      address: (error as any)?.address,
      port: (error as any)?.port,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
