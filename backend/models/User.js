const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // Physical profile (for nutrition calculations)
    weight: { type: Number, required: true },       // kg
    height: { type: Number, required: true },       // cm
    age:    { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      required: true,
    },
    fitnessGoal: {
      type: String,
      enum: ['lose_weight', 'maintain', 'gain_muscle'],
      required: true,
    },

    // Financial profile
    monthlySalary: { type: Number, required: true, default: 0 },

    // Computed targets (calculated on registration)
    dailyCalories:  { type: Number },
    dailyProtein:   { type: Number },
    dailyCarbs:     { type: Number },
    dailyFats:      { type: Number },
    dailyFiber:     { type: Number },

    // Refresh token storage
    refreshToken: { type: String, default: null },

    // Gym streak tracking
    gymStreak: { type: Number, default: 0 },
    lastGymDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
