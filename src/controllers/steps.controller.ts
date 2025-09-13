import { Request, Response } from 'express';
import { StepsRepo } from '../repos/steps.repo';
import { UsersRepo } from '../repos/users.repo';
import { logger } from '../config/logger';
import { StepsUpdateSchema } from '../schemas/steps.schema';

export const StepsController = {
  me: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      logger.info('Fetching today\'s steps data', { firebaseUid });
      
      const user = await UsersRepo.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('User not found when fetching steps', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
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
        firebaseUid: req.user?.uid,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch today\'s steps' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Validate request body
      const validationResult = StepsUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid steps update request data', { 
          errors: validationResult.error.errors,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const { stepCount, date } = validationResult.data;
      
      // Get user from database
      const user = await UsersRepo.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('User not found when updating steps', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Use provided date or default to today
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      logger.info('Updating steps data', { 
        firebaseUid,
        userId: user.id,
        stepCount,
        date: targetDate
      });

      const stepsRecord = await StepsRepo.upsertByUserIdAndDate(
        user.id, 
        targetDate, 
        stepCount
      );
      
      logger.info('Steps updated successfully', { 
        userId: user.id,
        stepCount: stepsRecord.stepCount,
        stepDate: stepsRecord.stepDate
      });
      
      return res.json({
        success: true,
        steps: {
          id: stepsRecord.id.toString(),
          userId: stepsRecord.userId,
          stepDate: stepsRecord.stepDate,
          stepCount: stepsRecord.stepCount,
          lastSyncedAt: stepsRecord.lastSyncedAt,
        }
      });
    } catch (error) {
      logger.error('Error updating steps', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to update steps' });
    }
  },
};
