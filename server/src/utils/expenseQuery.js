import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../models/Expense.js';
import { endOfDayExclusive, startOfDay } from './dates.js';

const SORT_FIELDS = { date: 'date', amount: 'amount', title: 'title', createdAt: 'createdAt' };
const MAX_LIMIT = 100;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toNumber(value) {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/**
 * Translates query-string parameters into a MongoDB filter, sort and
 * pagination settings for the current user's expenses.
 *
 * Supported params: search, category, paymentMethod, startDate, endDate,
 * minAmount, maxAmount, sortBy (date|amount|title|createdAt), order (asc|desc),
 * page, limit.
 */
export function buildExpenseQuery(userId, query) {
  const filter = { user: userId };

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: regex }, { notes: regex }];
  }

  if (query.category && mongoose.isValidObjectId(query.category)) {
    filter.category = new mongoose.Types.ObjectId(String(query.category));
  }

  if (PAYMENT_METHODS.includes(query.paymentMethod)) {
    filter.paymentMethod = query.paymentMethod;
  }

  if (isValidDate(query.startDate) || isValidDate(query.endDate)) {
    filter.date = {};
    if (isValidDate(query.startDate)) filter.date.$gte = startOfDay(query.startDate);
    if (isValidDate(query.endDate)) filter.date.$lt = endOfDayExclusive(query.endDate);
  }

  const minAmount = toNumber(query.minAmount);
  const maxAmount = toNumber(query.maxAmount);
  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = {};
    if (minAmount !== undefined) filter.amount.$gte = minAmount;
    if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
  }

  const sortField = SORT_FIELDS[query.sortBy] || 'date';
  const direction = query.order === 'asc' ? 1 : -1;
  // Secondary sort keeps pagination stable when primary values tie.
  const sort = { [sortField]: direction, _id: direction };

  const page = Math.max(1, Math.floor(toNumber(query.page) || 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(toNumber(query.limit) || 10)));

  return { filter, sort, page, limit, skip: (page - 1) * limit };
}
