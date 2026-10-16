import { Router } from 'express';
import { getInsights } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Every admin route requires a signed-in user with the admin role.
router.use(authenticate, requireRole('admin'));

router.get('/insights', getInsights);

export default router;
