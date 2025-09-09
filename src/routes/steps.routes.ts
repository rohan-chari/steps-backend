import { Router } from 'express';
import { StepsController } from '../controllers/steps.controller';

const r = Router();

// GET /api/steps/me/today -> returns the steps for the user making the request
r.get('/me/today', StepsController.me);

export default r;
