/**
 * Nutrition Service
 * Uses Mifflin-St Jeor equation for BMR/TDEE calculation
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary:         1.2,
  lightly_active:    1.375,
  moderately_active: 1.55,
  very_active:       1.725,
  extra_active:      1.9,
};

/**
 * Protein targets per kg of bodyweight (evidence-based)
 * lose_weight: 1.8g/kg  — preserve muscle during deficit
 * maintain:    2.0g/kg  — standard active maintenance
 * gain_muscle: 2.2g/kg  — optimal for hypertrophy
 */
const PROTEIN_PER_KG = {
  lose_weight:  1.8,
  maintain:     2.0,
  gain_muscle:  2.2,
};

// Fat targets: minimum healthy amount (g/kg bodyweight)
const FAT_PER_KG = {
  lose_weight:  0.8,
  maintain:     1.0,
  gain_muscle:  0.9,
};

// Calorie adjustments per goal
const GOAL_ADJUSTMENTS = {
  lose_weight:  -500,
  maintain:     0,
  gain_muscle:  +300,
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
function calculateBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
function calculateTDEE(bmr, activityLevel) {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2));
}

/**
 * Calculate all daily macro targets for a user
 * Protein & fats are bodyweight-based (science-backed).
 * Remaining calories go to carbs.
 */
function calculateDailyTargets(profile) {
  const { weight, height, age, gender, activityLevel, fitnessGoal } = profile;

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const adjustment = GOAL_ADJUSTMENTS[fitnessGoal] || 0;
  const dailyCalories = Math.round(tdee + adjustment);

  // Protein: g/kg bodyweight (science-based)
  const dailyProtein = Math.round(weight * (PROTEIN_PER_KG[fitnessGoal] || 2.0));

  // Fats: g/kg bodyweight (minimum healthy)
  const dailyFats = Math.round(weight * (FAT_PER_KG[fitnessGoal] || 1.0));

  // Carbs: fill remaining calories (1g protein=4kcal, 1g fat=9kcal, 1g carb=4kcal)
  const proteinCals = dailyProtein * 4;
  const fatCals     = dailyFats * 9;
  const dailyCarbs  = Math.max(50, Math.round((dailyCalories - proteinCals - fatCals) / 4));

  // Fiber: 14g per 1000 kcal (standard recommendation)
  const dailyFiber = Math.round((dailyCalories / 1000) * 14);

  return {
    dailyCalories,
    dailyProtein,
    dailyCarbs,
    dailyFats,
    dailyFiber,
    bmr: Math.round(bmr),
    tdee,
  };
}

/**
 * Calculate remaining macros for the day
 */
function calculateRemaining(targets, consumed) {
  const remaining = {
    calories: Math.max(0, targets.dailyCalories - consumed.calories),
    protein:  Math.max(0, targets.dailyProtein  - consumed.protein),
    carbs:    Math.max(0, targets.dailyCarbs     - consumed.carbs),
    fats:     Math.max(0, targets.dailyFats      - consumed.fats),
    fiber:    Math.max(0, targets.dailyFiber     - consumed.fiber),
  };

  const percentLeft = {
    calories: Math.round((remaining.calories / targets.dailyCalories) * 100),
    protein:  Math.round((remaining.protein  / targets.dailyProtein)  * 100),
    carbs:    Math.round((remaining.carbs    / targets.dailyCarbs)    * 100),
    fats:     Math.round((remaining.fats     / targets.dailyFats)     * 100),
    fiber:    Math.round((remaining.fiber    / targets.dailyFiber)    * 100),
  };

  const percentConsumed = {
    calories: 100 - percentLeft.calories,
    protein:  100 - percentLeft.protein,
    carbs:    100 - percentLeft.carbs,
    fats:     100 - percentLeft.fats,
    fiber:    100 - percentLeft.fiber,
  };

  return { remaining, percentLeft, percentConsumed };
}

module.exports = { calculateDailyTargets, calculateRemaining, calculateBMR, calculateTDEE };
