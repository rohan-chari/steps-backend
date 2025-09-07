import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check endpoint
router.get('/db-health', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Steps App API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      dbHealth: '/api/db-health',
      users: '/api/users'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
