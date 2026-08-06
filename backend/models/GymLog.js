const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  quantity: { type: Number, required: true }, // grams
  calories: { type: Number, required: true },
  protein:  { type: Number, required: true },
  carbs:    { type: Number, required: true },
  fats:     { type: Number, required: true },
  fiber:    { type: Number, default: 0 },
});

const gymLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD' for easy daily grouping

    // All food items logged that day
    meals: [foodItemSchema],

    // Cumulative daily totals (auto-computed)
    totalCalories: { type: Number, default: 0 },
    totalProtein:  { type: Number, default: 0 },
    totalCarbs:    { type: Number, default: 0 },
    totalFats:     { type: Number, default: 0 },
    totalFiber:    { type: Number, default: 0 },

    // AI-generated note or recommendation for the day
    aiNote: { type: String, default: '' },

    // Whether the user hit their calorie target
    goalMet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index: one log per user per day
gymLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('GymLog', gymLogSchema);
