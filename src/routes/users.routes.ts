import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { firebaseAuth } from '../middleware/auth';

const r = Router();

// GET /api/users/me -> returns the user making the request (requires auth)
r.get('/me', firebaseAuth, UsersController.me);

// POST /api/users/sync -> syncs user data from frontend (requires auth)
r.post('/sync', firebaseAuth, UsersController.sync);

export default r;