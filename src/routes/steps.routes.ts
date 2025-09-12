import { Router } from 'express';
import { StepsController } from '../controllers/steps.controller';
import { firebaseAuth } from '../middleware/auth';

const r = Router();

// GET /api/steps/me/today -> returns the steps for the user making the request (requires auth)
r.get('/me/today', firebaseAuth, StepsController.me);

export default r;
