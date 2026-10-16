import { Category } from '../models/Category.js';
import { Expense } from '../models/Expense.js';
import { ApiError } from '../utils/ApiError.js';

async function findCategory(id) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

async function assertNameAvailable(name, excludeId) {
  const key = name.trim().toLowerCase();
  const clash = await Category.findOne({ key, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  if (clash) throw ApiError.conflict(`A category named "${clash.name}" already exists`);
}

/** GET /api/categories — available to every signed-in user (for forms and filters). */
export async function listCategories(req, res) {
  await Category.getDefault(); // guarantees the fallback category always exists
  const categories = await Category.find().sort({ isDefault: -1, name: 1 });

  // Include usage counts so the admin table can warn before deleting.
  const usage = await Expense.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const counts = new Map(usage.map((u) => [String(u._id), u.count]));

  res.json(
    categories.map((c) => ({ ...c.toPublic(), expenseCount: counts.get(c._id.toString()) ?? 0 })),
  );
}

/** POST /api/categories (admin) */
export async function createCategory(req, res) {
  const { name, color } = req.body;
  await assertNameAvailable(name);
  const category = await Category.create({ name, color });
  res.status(201).json({ ...category.toPublic(), expenseCount: 0 });
}

/** PUT /api/categories/:id (admin) */
export async function updateCategory(req, res) {
  const category = await findCategory(req.params.id);
  const { name, color } = req.body;

  if (name !== undefined) {
    await assertNameAvailable(name, category._id);
    category.name = name;
  }
  if (color !== undefined) category.color = color;

  await category.save();
  const expenseCount = await Expense.countDocuments({ category: category._id });
  res.json({ ...category.toPublic(), expenseCount });
}

/**
 * DELETE /api/categories/:id (admin)
 * Expenses tied to the deleted category are moved to the default
 * "Uncategorized" category so no expense is ever left without a category.
 */
export async function deleteCategory(req, res) {
  const category = await findCategory(req.params.id);
  if (category.isDefault) {
    throw ApiError.badRequest('The default category cannot be deleted');
  }

  const fallback = await Category.getDefault();
  const { modifiedCount } = await Expense.updateMany(
    { category: category._id },
    { $set: { category: fallback._id } },
  );
  await category.deleteOne();

  res.json({
    message: `Category deleted. ${modifiedCount} expense(s) moved to "${fallback.name}".`,
    id: category._id.toString(),
    reassignedCount: modifiedCount,
    reassignedTo: fallback.toPublic(),
  });
}
