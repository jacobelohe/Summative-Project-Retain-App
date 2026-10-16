import mongoose from 'mongoose';

export const DEFAULT_CATEGORY_NAME = 'Uncategorized';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 40,
    },
    /** Lower-cased name used to enforce case-insensitive uniqueness. */
    key: { type: String, unique: true, index: true },
    color: {
      type: String,
      default: '#607d8b',
      match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #1a2b3c'],
    },
    /** The fallback category: cannot be deleted, receives orphaned expenses. */
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.pre('validate', function setKey() {
  if (this.name) this.key = this.name.trim().toLowerCase();
});

categorySchema.statics.getDefault = async function getDefault() {
  const existing = await this.findOne({ isDefault: true });
  if (existing) return existing;
  return this.create({ name: DEFAULT_CATEGORY_NAME, color: '#9e9e9e', isDefault: true });
};

categorySchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    color: this.color,
    isDefault: this.isDefault,
    createdAt: this.createdAt,
  };
};

export const Category = mongoose.model('Category', categorySchema);
