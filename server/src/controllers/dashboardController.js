import { Expense, serializeExpense } from '../models/Expense.js';
import { ApiError } from '../utils/ApiError.js';
import { currentMonth, monthRange, MONTH_PATTERN } from '../utils/dates.js';
import { getBudgetOverview, round } from '../services/budgetService.js';

/**
 * GET /api/dashboard/summary?month=YYYY-MM
 * Everything the user dashboard needs for one month in a single request:
 * totals, budget status, highest expense, spending by category and recent expenses.
 */
export async function getSummary(req, res) {
  const month = req.query.month || currentMonth();
  if (!MONTH_PATTERN.test(month)) throw ApiError.badRequest('Month must be in YYYY-MM format');

  const userId = req.user._id;
  const { start, end } = monthRange(month);
  const inMonth = { user: userId, date: { $gte: start, $lt: end } };

  const [overview, highest, byCategory, recent] = await Promise.all([
    getBudgetOverview(userId, month),
    Expense.findOne(inMonth).sort({ amount: -1 }).populate('category', 'name color').lean(),
    Expense.aggregate([
      { $match: inMonth },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
    ]),
    // Recent = most recently recorded, regardless of month.
    Expense.find({ user: userId }).sort({ createdAt: -1 }).limit(5).populate('category', 'name color').lean(),
  ]);

  res.json({
    ...overview,
    highestExpense: highest ? serializeExpense(highest) : null,
    byCategory: byCategory.map((c) => ({
      categoryId: c._id?.toString() ?? null,
      name: c.category?.name ?? 'Unknown',
      color: c.category?.color ?? '#9e9e9e',
      total: round(c.total),
      count: c.count,
    })),
    recentExpenses: recent.map(serializeExpense),
  });
}
