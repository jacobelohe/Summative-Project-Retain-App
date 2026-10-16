import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

const idParam = param('id').isMongoId().withMessage('Invalid category id');
const colorRule = body('color')
  .optional()
  .matches(/^#[0-9a-fA-F]{6}$/)
  .withMessage('Color must be a hex value like #1a2b3c');

router.get('/', listCategories);

router.post(
  '/',
  requireRole('admin'),
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 40 }),
  colorRule,
  validate,
  createCategory,
);

router.put(
  '/:id',
  requireRole('admin'),
  idParam,
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty').isLength({ max: 40 }),
  colorRule,
  validate,
  updateCategory,
);

router.delete('/:id', requireRole('admin'), idParam, validate, deleteCategory);

export default router;
