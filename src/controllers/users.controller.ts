import { Request, Response } from 'express';
import { UsersRepo } from '../repos/users.repo';
import { logger } from '../config/logger';

// TODO(auth): replace with real auth middleware (Firebase/local-jwt)
// For now we read a single dev UID from env and fetch that user.
const DEV_UID = 'uid-123';

export const UsersController = {
  me: async (_req: Request, res: Response) => {
    try {
      logger.info('Fetching user data', { firebaseUid: DEV_UID });
      
      const user = await UsersRepo.findByFirebaseUid(DEV_UID);
      if (!user) {
        logger.warn('User not found', { firebaseUid: DEV_UID });
        return res.status(404).json({ error: 'User not found (dev uid)' });
      }
      
      logger.info('User fetched successfully', { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      });
      
      return res.json(user);
    } catch (error) {
      logger.error('Error fetching user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: DEV_UID,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  },
};
