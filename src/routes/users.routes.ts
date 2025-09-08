import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';

const r = Router();

// GET /api/users/me -> returns the user making the request
r.get('/me', UsersController.me);

export default r;