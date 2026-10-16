import { Router } from 'express';
import { getSummary } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authenticate, getSummary);

export default router;
