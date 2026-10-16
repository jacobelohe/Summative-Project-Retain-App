import { Budget } from '../models/Budget.js';
import { getBudgetOverview } from '../services/budgetService.js';

/** GET /api/budgets — every budget the user has set, newest month first. */
export async function listBudgets(req, res) {
  const budgets = await Budget.find({ user: req.user._id }).sort({ month: -1 }).limit(24);
  res.json(budgets.map((b) => b.toPublic()));
}

/** GET /api/budgets/:month — budget, spending and status for a month. */
export async function getBudget(req, res) {
  res.json(await getBudgetOverview(req.user._id, req.params.month));
}

/** PUT /api/budgets/:month — create or update the budget for a month. */
export async function upsertBudget(req, res) {
  await Budget.findOneAndUpdate(
    { user: req.user._id, month: req.params.month },
    { $set: { amount: req.body.amount } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.json(await getBudgetOverview(req.user._id, req.params.month));
}

/** DELETE /api/budgets/:month — clear the budget for a month. */
export async function deleteBudget(req, res) {
  await Budget.deleteOne({ user: req.user._id, month: req.params.month });
  res.json(await getBudgetOverview(req.user._id, req.params.month));
}
