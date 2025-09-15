import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/error';
import userRoutes from './users.routes';
import stepsRoutes from './steps.routes';
import socialRoutes from './social.routes';

const router = Router();

// Mount route modules
router.use('/users', userRoutes);
router.use('/steps', stepsRoutes);
router.use('/social', socialRoutes);

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
      users: '/api/users/me',
      userSync: '/api/users/sync',
      userUpdate: '/api/users/update',
      userHomepage: '/api/users/homepage',
      userSearch: '/api/users/search',
      steps: '/api/steps/me/today',
      stepsUpdate: '/api/steps/update',
      social: {
        sendFriendRequest: '/api/social/friend-requests',
        respondToFriendRequest: '/api/social/friend-requests/respond',
        cancelFriendRequest: '/api/social/friend-requests/cancel',
        getFriendRequests: '/api/social/friend-requests',
        getFriends: '/api/social/friends'
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
