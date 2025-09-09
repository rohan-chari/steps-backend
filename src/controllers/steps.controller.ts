import { Request, Response } from 'express';
import { StepsRepo } from '../repos/steps.repo';
import { UsersRepo } from '../repos/users.repo';
import { logger } from '../config/logger';

// TODO(auth): replace with real auth middleware (Firebase/local-jwt)
// For now we read a single dev UID from env and fetch that user.
const DEV_UID = 'uid-123';

export const StepsController = {
  me: async (_req: Request, res: Response) => {
    try {
      logger.info('Fetching today\'s steps data', { firebaseUid: DEV_UID });
      
      const user = await UsersRepo.findByFirebaseUid(DEV_UID);
      if (!user) {
        logger.warn('User not found when fetching steps', { firebaseUid: DEV_UID });
        return res.status(404).json({ error: 'User not found (dev uid)' });
      }
      
      // Get today's date (date only, no time)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // Create date string in YYYY-MM-DD format for database comparison
      const todayDateString = today.toISOString().split('T')[0];
      
      logger.info('User found, fetching today\'s steps', { 
        userId: user.id, 
        today: todayDateString 
      });
      
      const todaySteps = await StepsRepo.findByUserIdAndDate(user.id, todayDateString);
      
      if (todaySteps) {
        logger.info('Today\'s steps found', { 
          userId: user.id,
          stepCount: todaySteps.stepCount,
          stepDate: todaySteps.stepDate
        });
        
        const serializedStep = {
          ...todaySteps,
          id: todaySteps.id.toString()
        };
        
        return res.json(serializedStep);
      } else {
        logger.info('No steps found for today, returning default', { 
          userId: user.id,
          stepDate: todayDateString
        });
        
        // Return default step entry for today with 0 steps
        const defaultStep = {
          id: null,
          userId: user.id,
          stepDate: todayDateString,
          stepCount: 0,
          sourceHint: null,
          lastSyncedAt: new Date()
        };
        
        return res.json(defaultStep);
      }
    } catch (error) {
      logger.error('Error fetching today\'s steps', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: DEV_UID,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch today\'s steps' });
    }
  },
};
