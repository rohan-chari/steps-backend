import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { firebaseAuth } from '../middleware/auth';

const r = Router();

// POST /api/social/friend-requests -> send a friend request (requires auth)
r.post('/friend-requests',firebaseAuth, SocialController.sendFriendRequest);

// PUT /api/social/friend-requests/respond -> respond to a friend request (requires auth)
r.put('/friend-requests/respond', firebaseAuth, SocialController.respondToFriendRequest);

// PUT /api/social/friend-requests/cancel -> cancel a friend request (requires auth)
r.put('/friend-requests/cancel', firebaseAuth, SocialController.cancelFriendRequest);

// GET /api/social/friend-requests -> get all friend requests (requires auth)
r.get('/friend-requests', firebaseAuth, SocialController.getFriendRequests);

// GET /api/social/friends -> get all friends (requires auth)
r.get('/friends', firebaseAuth, SocialController.getFriends);

export default r;
