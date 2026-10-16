import mongoose from 'mongoose';

export const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'bank_transfer', 'other'];

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: [true, 'Date is required'] },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true },
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });

/**
 * Converts a (populated) expense document or lean object into the API shape.
 */
export function serializeExpense(expense) {
  const category = expense.category;
  const populated = category && typeof category === 'object' && 'name' in category;
  return {
    id: expense._id.toString(),
    title: expense.title,
    amount: expense.amount,
    category: populated
      ? { id: category._id.toString(), name: category.name, color: category.color }
      : null,
    date: expense.date,
    paymentMethod: expense.paymentMethod,
    notes: expense.notes || '',
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

export const Expense = mongoose.model('Expense', expenseSchema);
