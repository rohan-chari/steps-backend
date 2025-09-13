import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { firebaseAuth } from '../middleware/auth';

const r = Router();

// GET /api/users/me -> returns the user making the request (requires auth)
r.get('/me', firebaseAuth, UsersController.me);

// POST /api/users/sync -> ensures user exists in database (requires auth)
r.post('/sync', firebaseAuth, UsersController.sync);

// PUT /api/users/update -> updates user profile data (requires auth)
r.put('/update', firebaseAuth, UsersController.update);

// GET /api/users/homepage -> returns comprehensive homepage data (requires auth)
r.get('/homepage', firebaseAuth, UsersController.homepage);

// GET /api/users/search?q=searchterm -> search for users by username/displayName (requires auth)
r.get('/search', firebaseAuth, UsersController.search);

export default r;