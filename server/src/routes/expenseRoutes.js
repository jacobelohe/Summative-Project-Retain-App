import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { PAYMENT_METHODS } from '../models/Expense.js';

const router = Router();

router.use(authenticate);

const idParam = param('id').isMongoId().withMessage('Invalid expense id');

/** Validation shared by create (all required) and update (all optional). */
function expenseRules({ optional }) {
  const field = (name) => (optional ? body(name).optional() : body(name));
  return [
    field('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
    field('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than zero').toFloat(),
    field('category').isMongoId().withMessage('A valid category is required'),
    field('date').isISO8601().withMessage('A valid date is required (YYYY-MM-DD)'),
    field('paymentMethod')
      .isIn(PAYMENT_METHODS)
      .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be 500 characters or fewer'),
  ];
}

router.get('/', listExpenses);
router.post('/', expenseRules({ optional: false }), validate, createExpense);
router.get('/:id', idParam, validate, getExpense);
router.put('/:id', idParam, expenseRules({ optional: true }), validate, updateExpense);
router.delete('/:id', idParam, validate, deleteExpense);

export default router;
