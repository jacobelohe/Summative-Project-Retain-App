import { Router } from 'express';
import { body, param } from 'express-validator';
import { listBudgets, getBudget, upsertBudget, deleteBudget } from '../controllers/budgetController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { MONTH_PATTERN } from '../utils/dates.js';

const router = Router();

router.use(authenticate);

const monthParam = param('month').matches(MONTH_PATTERN).withMessage('Month must be in YYYY-MM format');

router.get('/', listBudgets);
router.get('/:month', monthParam, validate, getBudget);
router.put(
  '/:month',
  monthParam,
  body('amount').isFloat({ min: 0 }).withMessage('Budget must be a number of zero or more').toFloat(),
  validate,
  upsertBudget,
);
router.delete('/:month', monthParam, validate, deleteBudget);

export default router;
