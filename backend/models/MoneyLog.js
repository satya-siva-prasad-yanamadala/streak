const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Bills & Utilities',
  'Education',
  'Travel',
  'Personal Care',
  'Investment',
  'Other',
];

const moneyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'

    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },

    amount: { type: Number, required: true },

    category: {
      type: String,
      enum: [...EXPENSE_CATEGORIES, 'Salary', 'Freelance', 'Other Income'],
      default: 'Other',
    },

    description: { type: String, trim: true, default: '' },

    // AI-extracted from natural language (e.g. "spent 500 on lunch")
    rawInput: { type: String, default: '' },
  },
  { timestamps: true }
);

moneyLogSchema.index({ user: 1, date: 1 });
moneyLogSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('MoneyLog', moneyLogSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
