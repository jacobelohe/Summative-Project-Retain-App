import { Expense, serializeExpense } from '../models/Expense.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { buildExpenseQuery } from '../utils/expenseQuery.js';

const CATEGORY_FIELDS = 'name color';

/** Picks the editable fields from the request body. */
function pickExpenseFields(body) {
  const fields = {};
  for (const key of ['title', 'amount', 'category', 'date', 'paymentMethod', 'notes']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

async function assertCategoryExists(categoryId) {
  if (!(await Category.exists({ _id: categoryId }))) {
    throw ApiError.badRequest('Selected category does not exist');
  }
}

/** Finds an expense that belongs to the current user, or throws 404. */
async function findOwnedExpense(req) {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'category',
    CATEGORY_FIELDS,
  );
  if (!expense) throw ApiError.notFound('Expense not found');
  return expense;
}

/** GET /api/expenses — filtered, sorted and paginated list of the user's expenses. */
export async function listExpenses(req, res) {
  const { filter, sort, page, limit, skip } = buildExpenseQuery(req.user._id, req.query);

  const [items, total, totals] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(limit).populate('category', CATEGORY_FIELDS).lean(),
    Expense.countDocuments(filter),
    Expense.aggregate([{ $match: filter }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
  ]);

  res.json({
    data: items.map(serializeExpense),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    totalAmount: totals[0]?.sum ?? 0,
  });
}

/** GET /api/expenses/:id */
export async function getExpense(req, res) {
  const expense = await findOwnedExpense(req);
  res.json(serializeExpense(expense));
}

/** POST /api/expenses */
export async function createExpense(req, res) {
  const fields = pickExpenseFields(req.body);
  await assertCategoryExists(fields.category);

  const expense = await Expense.create({ ...fields, user: req.user._id });
  await expense.populate('category', CATEGORY_FIELDS);
  res.status(201).json(serializeExpense(expense));
}

/** PUT /api/expenses/:id */
export async function updateExpense(req, res) {
  const expense = await findOwnedExpense(req);
  const fields = pickExpenseFields(req.body);
  if (fields.category) await assertCategoryExists(fields.category);

  expense.set(fields);
  await expense.save();
  await expense.populate('category', CATEGORY_FIELDS);
  res.json(serializeExpense(expense));
}

/** DELETE /api/expenses/:id */
export async function deleteExpense(req, res) {
  const expense = await findOwnedExpense(req);
  await expense.deleteOne();
  res.json({ message: 'Expense deleted', id: expense._id.toString() });
}
