import { User } from '../models/User.js';
import { Expense, serializeExpense } from '../models/Expense.js';
import { Category } from '../models/Category.js';
import { currentMonth, monthRange } from '../utils/dates.js';
import { round } from '../services/budgetService.js';

/**
 * Usage and spending per category, including categories with no expenses
 * (so the "least used" list is meaningful).
 */
async function categoryUsage() {
  return Category.aggregate([
    {
      $lookup: {
        from: 'expenses',
        localField: '_id',
        foreignField: 'category',
        as: 'expenses',
        pipeline: [{ $project: { amount: 1 } }],
      },
    },
    {
      $project: {
        name: 1,
        color: 1,
        isDefault: 1,
        count: { $size: '$expenses' },
        total: { $sum: '$expenses.amount' },
      },
    },
  ]);
}

/** GET /api/admin/insights — platform-wide statistics for admins. */
export async function getInsights(req, res) {
  const { start, end } = monthRange(currentMonth());

  const [users, expenses, totalValue, thisMonth, usage, recentExpenses, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Expense.countDocuments({ date: { $gte: start, $lt: end } }),
      categoryUsage(),
      Expense.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('category', 'name color')
        .populate('user', 'name email')
        .lean(),
      User.find().sort({ createdAt: -1 }).limit(8),
    ]);

  const categories = usage.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    color: c.color,
    isDefault: c.isDefault,
    count: c.count,
    total: round(c.total),
  }));

  const byUsageDesc = [...categories].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const byUsageAsc = [...categories].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));

  res.json({
    totals: {
      users,
      expenses,
      value: round(totalValue[0]?.sum ?? 0),
      expensesThisMonth: thisMonth,
    },
    spendingByCategory: [...categories].sort((a, b) => b.total - a.total),
    topCategories: byUsageDesc.slice(0, 5),
    bottomCategories: byUsageAsc.slice(0, 5),
    recentExpenses: recentExpenses.map((e) => ({
      ...serializeExpense(e),
      user: e.user ? { id: e.user._id.toString(), name: e.user.name, email: e.user.email } : null,
    })),
    recentUsers: recentUsers.map((u) => u.toPublic()),
  });
}
