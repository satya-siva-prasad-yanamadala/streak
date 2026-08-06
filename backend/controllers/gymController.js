const GymLog = require('../models/GymLog');
const { calculateRemaining } = require('../services/nutritionService');
const {
  parseFoodWithAI,
  generateAIAdvice,
  buildGymMessage,
  getFallbackTip,
} = require('../services/aiService');

// Get today's date string in YYYY-MM-DD
const todayStr = () => new Date().toISOString().split('T')[0];

// @desc  Log food items (chat message)
// @route POST /api/gym/log
const logFood = async (req, res) => {
  const { input } = req.body;
  if (!input || !input.trim()) {
    res.status(400);
    throw new Error('Please describe what you ate');
  }

  // Check API key is configured
  if (!process.env.GROQ_API_KEY) {
    return res.json({
      success: false,
      recognized: false,
      message: `⚙️ **AI not configured yet.**\n\nTo enable food tracking:\n1. Go to [console.groq.com](https://console.groq.com) and get a free API key\n2. Add it to your \`.env\` file:\n\`\`\`\nGROQ_API_KEY=gsk_your_key_here\n\`\`\`\n3. Restart the server`,
    });
  }

  // Use Groq LLM to parse food — accurate, real values, no hardcoded database
  const newFoods = await parseFoodWithAI(input);

  if (!newFoods || newFoods.length === 0) {
    return res.json({
      success: true,
      recognized: false,
      message: `🤔 I couldn't identify specific foods in: *"${input}"*\n\nTry being more specific, e.g.:\n• "3 boiled eggs"\n• "250ml milk, 20g oats, 8 almonds"\n• "200g grilled chicken with rice"`,
    });
  }


  const date = todayStr();
  const user = req.user;

  // Find or create today's log
  let gymLog = await GymLog.findOne({ user: user._id, date });
  if (!gymLog) {
    gymLog = new GymLog({
      user: user._id, date, meals: [],
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0, totalFiber: 0,
    });
  }

  // Add new food items
  gymLog.meals.push(...newFoods);

  // Recalculate totals
  gymLog.totalCalories = gymLog.meals.reduce((s, m) => s + m.calories, 0);
  gymLog.totalProtein  = gymLog.meals.reduce((s, m) => s + m.protein, 0);
  gymLog.totalCarbs    = gymLog.meals.reduce((s, m) => s + m.carbs, 0);
  gymLog.totalFats     = gymLog.meals.reduce((s, m) => s + m.fats, 0);
  gymLog.totalFiber    = gymLog.meals.reduce((s, m) => s + m.fiber, 0);

  const targets = {
    dailyCalories: user.dailyCalories,
    dailyProtein:  user.dailyProtein,
    dailyCarbs:    user.dailyCarbs,
    dailyFats:     user.dailyFats,
    dailyFiber:    user.dailyFiber,
  };

  const consumed = {
    calories: Math.round(gymLog.totalCalories * 10) / 10,
    protein:  Math.round(gymLog.totalProtein  * 10) / 10,
    carbs:    Math.round(gymLog.totalCarbs    * 10) / 10,
    fats:     Math.round(gymLog.totalFats     * 10) / 10,
    fiber:    Math.round(gymLog.totalFiber    * 10) / 10,
  };

  const { remaining, percentLeft, percentConsumed } = calculateRemaining(targets, consumed);

  gymLog.goalMet = consumed.calories >= targets.dailyCalories * 0.9 &&
                   consumed.calories <= targets.dailyCalories * 1.1;

  await gymLog.save();

  // Always use Groq for personalized advice
  const tip = await generateAIAdvice(consumed, targets, newFoods, user.fitnessGoal)
              || getFallbackTip(consumed, targets);

  const message = buildGymMessage(consumed, targets, remaining, percentLeft, newFoods, tip);

  res.json({
    success: true,
    recognized: true,
    message,
    data: {
      newFoods,
      consumed,
      remaining,
      percentLeft,
      percentConsumed,
      targets,
      goalMet: gymLog.goalMet,
    },
  });
};


// @desc  Get today's gym log
// @route GET /api/gym/today
const getTodayLog = async (req, res) => {
  const date = todayStr();
  const gymLog = await GymLog.findOne({ user: req.user._id, date });

  const targets = {
    dailyCalories: req.user.dailyCalories,
    dailyProtein:  req.user.dailyProtein,
    dailyCarbs:    req.user.dailyCarbs,
    dailyFats:     req.user.dailyFats,
    dailyFiber:    req.user.dailyFiber,
  };

  if (!gymLog) {
    return res.json({
      success: true,
      log: null,
      consumed: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      remaining: { ...targets },
      percentLeft: { calories: 100, protein: 100, carbs: 100, fats: 100, fiber: 100 },
      percentConsumed: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      targets,
    });
  }

  const consumed = {
    calories: gymLog.totalCalories,
    protein:  gymLog.totalProtein,
    carbs:    gymLog.totalCarbs,
    fats:     gymLog.totalFats,
    fiber:    gymLog.totalFiber,
  };

  const { remaining, percentLeft, percentConsumed } = calculateRemaining(targets, consumed);

  res.json({ success: true, log: gymLog, consumed, remaining, percentLeft, percentConsumed, targets });
};

// @desc  Get gym history (last 30 days)
// @route GET /api/gym/history
const getGymHistory = async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));
  const startStr = startDate.toISOString().split('T')[0];

  const logs = await GymLog.find({
    user: req.user._id,
    date: { $gte: startStr },
  }).sort({ date: -1 });

  res.json({ success: true, logs, count: logs.length });
};

// @desc  Get weekly summary
// @route GET /api/gym/weekly
const getWeeklySummary = async (req, res) => {
  const logs = await GymLog.find({
    user: req.user._id,
  }).sort({ date: -1 }).limit(7);

  const targets = {
    dailyCalories: req.user.dailyCalories,
    dailyProtein:  req.user.dailyProtein,
    dailyCarbs:    req.user.dailyCarbs,
    dailyFats:     req.user.dailyFats,
  };

  const avg = {
    calories: logs.length ? Math.round(logs.reduce((s, l) => s + l.totalCalories, 0) / logs.length) : 0,
    protein:  logs.length ? Math.round(logs.reduce((s, l) => s + l.totalProtein, 0) / logs.length) : 0,
    carbs:    logs.length ? Math.round(logs.reduce((s, l) => s + l.totalCarbs, 0) / logs.length) : 0,
    fats:     logs.length ? Math.round(logs.reduce((s, l) => s + l.totalFats, 0) / logs.length) : 0,
  };

  const daysGoalMet = logs.filter(l => l.goalMet).length;

  res.json({ success: true, logs, avg, targets, daysGoalMet, totalDays: logs.length });
};

module.exports = { logFood, getTodayLog, getGymHistory, getWeeklySummary };
