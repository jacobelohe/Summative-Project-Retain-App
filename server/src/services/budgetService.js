import { Expense } from '../models/Expense.js';
import { Budget } from '../models/Budget.js';
import { monthRange } from '../utils/dates.js';

/** Spending at or above this share of the budget counts as "approaching". */
export const APPROACHING_THRESHOLD = 0.8;

/**
 * Classifies spending against a budget:
 * - `unset`        no budget for the month
 * - `within`       below 80% of budget
 * - `approaching`  80% – 100% of budget
 * - `over`         more than the budget
 */
export function budgetStatus(spent, budget) {
  if (budget === null || budget === undefined) return 'unset';
  if (spent > budget) return 'over';
  if (budget === 0) return spent > 0 ? 'over' : 'within';
  return spent / budget >= APPROACHING_THRESHOLD ? 'approaching' : 'within';
}

export async function totalSpentInMonth(userId, month) {
  const { start, end } = monthRange(month);
  const [result] = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  return { total: result?.total ?? 0, count: result?.count ?? 0 };
}

/** Budget + spending overview for one user and month. */
export async function getBudgetOverview(userId, month) {
  const [budget, spent] = await Promise.all([
    Budget.findOne({ user: userId, month }),
    totalSpentInMonth(userId, month),
  ]);

  const amount = budget ? budget.amount : null;
  const totalSpent = round(spent.total);
  return {
    month,
    budget: amount,
    totalSpent,
    remaining: amount === null ? null : round(amount - totalSpent),
    percentUsed: amount ? round((totalSpent / amount) * 100) : null,
    status: budgetStatus(totalSpent, amount),
    expenseCount: spent.count,
  };
}

export function round(value) {
  return Math.round(value * 100) / 100;
}
