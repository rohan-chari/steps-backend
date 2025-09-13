import { Router } from 'express';
import { StepsController } from '../controllers/steps.controller';
import { firebaseAuth } from '../middleware/auth';

const r = Router();

// GET /api/steps/me/today -> returns the steps for the user making the request (requires auth)
r.get('/me/today', firebaseAuth, StepsController.me);

// PUT /api/steps/update -> updates daily steps for the user (requires auth)
r.put('/update', firebaseAuth, StepsController.update);

export default r;
