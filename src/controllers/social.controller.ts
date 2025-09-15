import { Request, Response } from 'express';
import { SocialRepo } from '../repos/social.repo';
import { logger } from '../config/logger';
import { SendFriendRequestSchema, RespondToFriendRequestSchema, CancelFriendRequestSchema } from '../schemas/social.schema';

export const SocialController = {
  sendFriendRequest: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Get current user from database
      const currentUser = await SocialRepo.getCurrentUser(firebaseUid);
      if (!currentUser) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Validate request body
      const validationResult = SendFriendRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid friend request data', { 
          errors: validationResult.error.errors,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const requestData = validationResult.data;
      
      logger.info('Sending friend request', { 
        senderId: currentUser.id,
        receiverId: requestData.receiverId
      });

      const friendRequest = await SocialRepo.sendFriendRequest(currentUser.id, requestData);
      
      logger.info('Friend request sent successfully', { 
        requestId: friendRequest.id,
        senderId: friendRequest.senderId,
        receiverId: friendRequest.receiverId
      });
      
      return res.status(201).json({
        success: true,
        friendRequest: {
          ...friendRequest,
          id: friendRequest.id.toString()
        }
      });
    } catch (error) {
      console.log('error', error);
      logger.error('Error sending friend request', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ 
        error: error instanceof Error ? error.message : 'Failed to send friend request' 
      });
    }
  },

  respondToFriendRequest: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Get current user from database
      const currentUser = await SocialRepo.getCurrentUser(firebaseUid);
      if (!currentUser) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Validate request body
      const validationResult = RespondToFriendRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid friend request response data', { 
          errors: validationResult.error.errors,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const responseData = validationResult.data;
      
      logger.info('Responding to friend request', { 
        userId: currentUser.id,
        requestId: responseData.requestId,
        status: responseData.status
      });

      const result = await SocialRepo.respondToFriendRequest(currentUser.id, responseData);
      
      logger.info('Friend request response processed successfully', { 
        requestId: responseData.requestId,
        status: responseData.status
      });
      
      // Check if it's a deletion (rejection) or update (acceptance)
      if ('success' in result) {
        // This is a rejection (deletion)
        return res.json(result);
      } else {
        // This is an acceptance (update)
        return res.json({
          success: true,
          friendRequest: {
            ...result,
            id: result.id.toString()
          }
        });
      }
    } catch (error) {
      logger.error('Error responding to friend request', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ 
        error: error instanceof Error ? error.message : 'Failed to respond to friend request' 
      });
    }
  },

  cancelFriendRequest: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Get current user from database
      const currentUser = await SocialRepo.getCurrentUser(firebaseUid);
      if (!currentUser) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Validate request body
      const validationResult = CancelFriendRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn('Invalid cancel friend request data', { 
          errors: validationResult.error.errors,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'Invalid request data',
          message: validationResult.error.message,
          details: validationResult.error.errors 
        });
      }

      const cancelData = validationResult.data;
      
      logger.info('Canceling friend request', { 
        userId: currentUser.id,
        requestId: cancelData.requestId
      });

      const result = await SocialRepo.cancelFriendRequest(currentUser.id, cancelData);
      
      logger.info('Friend request canceled successfully', { 
        requestId: cancelData.requestId
      });
      
      return res.json(result);
    } catch (error) {
      logger.error('Error canceling friend request', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ 
        error: error instanceof Error ? error.message : 'Failed to cancel friend request' 
      });
    }
  },

  getFriendRequests: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Get current user from database
      const currentUser = await SocialRepo.getCurrentUser(firebaseUid);
      if (!currentUser) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      logger.info('Fetching friend requests', { userId: currentUser.id });

      const friendRequests = await SocialRepo.getFriendRequests(currentUser.id);
      
      logger.info('Friend requests fetched successfully', { 
        userId: currentUser.id,
        incomingCount: friendRequests.incoming.length,
        outgoingCount: friendRequests.outgoing.length
      });
      
      return res.json({
        success: true,
        friendRequests: {
          incoming: friendRequests.incoming.map(req => ({
            ...req,
            id: req.id.toString()
          })),
          outgoing: friendRequests.outgoing.map(req => ({
            ...req,
            id: req.id.toString()
          }))
        }
      });
    } catch (error) {
      logger.error('Error fetching friend requests', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch friend requests' });
    }
  },

  getFriends: async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in request');
        return res.status(401).json({ error: 'Unauthorized - no user ID found' });
      }

      // Get current user from database
      const currentUser = await SocialRepo.getCurrentUser(firebaseUid);
      if (!currentUser) {
        logger.warn('User not found in database', { firebaseUid });
        return res.status(404).json({ error: 'User not found in database' });
      }

      logger.info('Fetching friends', { userId: currentUser.id });

      const friends = await SocialRepo.getFriends(currentUser.id);
      
      logger.info('Friends fetched successfully', { 
        userId: currentUser.id,
        friendsCount: friends.length
      });
      
      return res.json({
        success: true,
        friends
      });
    } catch (error) {
      logger.error('Error fetching friends', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        firebaseUid: req.user?.uid,
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Failed to fetch friends' });
    }
  }
};
