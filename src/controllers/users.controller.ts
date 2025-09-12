import { Request, Response } from 'express';
import { UsersRepo } from '../repos/users.repo';
import { logger } from '../config/logger';
import { UserSyncSchema } from '../schemas/users.schema';

export const UsersController = {
  me: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      logger.info('Fetching user data', { firebaseUid });
      
      const user = await UsersRepo.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
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
        firebaseUid: req.user?.uid,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  sync: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Validate request body
      const validationResult = UserSyncSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid sync request data', { 
          errors: validationResult.error.errors,
          body: req.body,
          errorMessage: validationResult.error.message,
          errorIssues: validationResult.error.issues
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const userData = validationResult.data;
      
      // Check if user has completed onboarding requirements
      const hasUsername = userData.username && userData.username.trim().length > 0;
      const hasDisplayName = userData.displayName && userData.displayName.trim().length > 0;
      const hasStepGoal = userData.stepGoal && userData.stepGoal > 0;
      
      // Auto-set isOnboarded based on completion of required fields
      const isOnboarded = hasUsername && hasDisplayName && hasStepGoal;
      
      // Override firebaseUid with the authenticated user's UID for security
      const secureUserData = {
        ...userData,
        firebaseUid: firebaseUid,
        isOnboarded: Boolean(isOnboarded)
      };
      
      logger.info('Syncing user data', { 
        firebaseUid: secureUserData.firebaseUid,
        email: secureUserData.email,
        username: secureUserData.username,
        displayName: secureUserData.displayName,
        stepGoal: secureUserData.stepGoal,
        isOnboarded: isOnboarded,
        onboardingCheck: {
          hasUsername,
          hasDisplayName,
          hasStepGoal
        }
      });

      const user = await UsersRepo.syncUser(secureUserData);
      
      logger.info('User synced successfully', { 
        userId: user.id, 
        firebaseUid: user.firebaseUid,
        email: user.email,
        username: user.username 
      });
      
      return res.json({
        success: true,
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoUrl: user.photoUrl,
          expoPushToken: user.expoPushToken,
          stepGoal: user.stepGoal,
          isOnboarded: user.isOnboarded,
          challengeWins: user.challengeWins,
          challengeLosses: user.challengeLosses,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      });
    } catch (error) {
      logger.error('Error syncing user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to sync user' });
    }
  },
};
