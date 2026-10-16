import mongoose from 'mongoose';
import { MONTH_PATTERN } from '../utils/dates.js';

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    /** Calendar month in `YYYY-MM` format. */
    month: { type: String, required: true, match: MONTH_PATTERN },
    amount: { type: Number, required: true, min: [0, 'Budget cannot be negative'] },
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

budgetSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    month: this.month,
    amount: this.amount,
    updatedAt: this.updatedAt,
  };
};

export const Budget = mongoose.model('Budget', budgetSchema);
