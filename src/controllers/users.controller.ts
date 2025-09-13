import { Request, Response } from 'express';
import { UsersRepo } from '../repos/users.repo';
import { logger } from '../config/logger';
import { UserSyncSchema, UserUpdateSchema } from '../schemas/users.schema';

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

      // Validate request body - only need email for sync
      const validationResult = UserSyncSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid sync request data', { 
          errors: validationResult.error.errors,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const { email } = validationResult.data;
      
      logger.info('Syncing user - ensuring user exists in database', { 
        firebaseUid,
        email
      });

      // Create user if they don't exist, or update lastLoginAt if they do
      const user = await UsersRepo.createUserIfNotExists(firebaseUid, email);
      
      logger.info('User sync completed', { 
        userId: user.id, 
        firebaseUid: user.firebaseUid,
        email: user.email,
        isNewUser: user.createdAt.getTime() === user.updatedAt.getTime()
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

  update: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Validate request body
      const validationResult = UserUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid update request data', { 
          errors: validationResult.error.errors,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const updateData = validationResult.data;
      
      logger.info('Updating user profile', { 
        firebaseUid,
        updateFields: Object.keys(updateData)
      });

      const user = await UsersRepo.updateUser(firebaseUid, updateData);
      
      logger.info('User profile updated successfully', { 
        userId: user.id, 
        firebaseUid: user.firebaseUid,
        isOnboarded: user.isOnboarded
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
      logger.error('Error updating user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to update user' });
    }
  },

  homepage: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      logger.info('Fetching homepage data', { firebaseUid });
      
      const user = await UsersRepo.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Calculate streaks from actual steps data
      const streaks = await UsersRepo.calculateStreaks(user.id);
      
      // Get incoming friend request count for notification badge
      const incomingFriendRequestCount = await UsersRepo.getIncomingFriendRequestCount(user.id);
      
      const homepageData = {
        streaks: {
          currentStreak: streaks.currentStreak,
          longestStreak: streaks.longestStreak,
        },
        challenges: {
          active: [], // TODO: Implement challenge system
          available: [], // TODO: Implement challenge system
          completed: [], // TODO: Implement challenge system
        },
        leaderboard: {
          weekly: [], // TODO: Implement leaderboard
          monthly: [], // TODO: Implement leaderboard
          allTime: [], // TODO: Implement leaderboard
        },
        notifications: incomingFriendRequestCount
      };
      
      logger.info('Homepage data fetched successfully', { 
        userId: user.id, 
        username: user.username 
      });
      
      return res.json(homepageData);
    } catch (error) {
      logger.error('Error fetching homepage data', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch homepage data' });
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;


      if (!query || query.trim().length < 2) {
        console.log('Query validation failed');
        return res.status(400).json({ 
          error: 'Query must be at least 2 characters long' 
        });
      }

      logger.info('Searching for users', { 
        firebaseUid, 
        query: query.trim(), 
        limit 
      });
      
      const user = await UsersRepo.findByFirebaseUid(firebaseUid);
      if (!user) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }


      const searchResults = await UsersRepo.searchUsers(query.trim(), user.id, limit);
      
      
      logger.info('User search completed', { 
        userId: user.id, 
        query: query.trim(),
        resultCount: searchResults.length 
      });
      console.log({
        success: true,
        query: query.trim(),
        results: searchResults,
        count: searchResults.length
      })
      return res.json({
        success: true,
        query: query.trim(),
        results: searchResults,
        count: searchResults.length
      });
    } catch (error) {
      console.error('Search error:', error);
      logger.error('Error searching users', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        query: req.query.q,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to search users' });
    }
  },
};
