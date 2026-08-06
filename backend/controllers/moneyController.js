const MoneyLog = require('../models/MoneyLog');
const { generateMoneyMessage, parseMoneyInput } = require('../services/aiService');

const todayStr = () => new Date().toISOString().split('T')[0];
const monthStr = () => new Date().toISOString().slice(0, 7); // YYYY-MM

// Get current month's financial summary for a user
async function getMonthlySummary(userId, monthlySalary) {
  const month = monthStr();
  const logs = await MoneyLog.find({
    user: userId,
    date: { $regex: `^${month}` },
  });

  const expenses = logs.filter(l => l.type === 'expense');
  const incomes  = logs.filter(l => l.type === 'income');

  const totalExpenses = expenses.reduce((s, l) => s + l.amount, 0);
  const extraIncome   = incomes.filter(l => l.category !== 'Salary').reduce((s, l) => s + l.amount, 0);
  const savings = monthlySalary + extraIncome - totalExpenses;

  // Category breakdown
  const categoryBreakdown = {};
  for (const log of expenses) {
    categoryBreakdown[log.category] = (categoryBreakdown[log.category] || 0) + log.amount;
  }

  return { totalExpenses, extraIncome, savings, categoryBreakdown };
}

// @desc  Log expense or income via natural language chat
// @route POST /api/money/log
const logMoney = async (req, res) => {
  const { input, type, amount, category, description } = req.body;
  const user = req.user;

  let logData = {};

  // If structured input provided directly
  if (amount && type) {
    logData = { type, amount: Number(amount), category: category || 'Other', description: description || '' };
  }
  // Parse from natural language
  else if (input) {
    const parsed = parseMoneyInput(input);
    if (!parsed.amount) {
      return res.json({
        success: true,
        recognized: false,
        message: `🤔 I couldn't find an amount in your message. Try:\n• "Spent 500 on food"\n• "Paid 200 for auto"\n• "Received 5000 salary"`,
      });
    }
    logData = {
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: input,
      rawInput: input,
    };
  } else {
    res.status(400);
    throw new Error('Please provide input or amount and type');
  }

  const date = todayStr();
  const entry = await MoneyLog.create({ user: user._id, date, ...logData });

  const { totalExpenses, extraIncome, savings } = await getMonthlySummary(user._id, user.monthlySalary);

  const message = generateMoneyMessage(entry, user.monthlySalary, totalExpenses, extraIncome, savings);

  res.status(201).json({
    success: true,
    recognized: true,
    message,
    data: { entry, monthlyExpenses: totalExpenses, extraIncome, savings },
  });
};

// @desc  Get today's money logs
// @route GET /api/money/today
const getTodayMoney = async (req, res) => {
  const date = todayStr();
  const logs = await MoneyLog.find({ user: req.user._id, date }).sort({ createdAt: -1 });
  const totalSpent  = logs.filter(l => l.type === 'expense').reduce((s, l) => s + l.amount, 0);
  const totalEarned = logs.filter(l => l.type === 'income').reduce((s, l) => s + l.amount, 0);
  res.json({ success: true, logs, totalSpent, totalEarned });
};

// @desc  Get monthly summary
// @route GET /api/money/monthly
const getMonthlySummaryRoute = async (req, res) => {
  const { month } = req.query; // optional: YYYY-MM
  const targetMonth = month || monthStr();
  const user = req.user;

  const logs = await MoneyLog.find({
    user: user._id,
    date: { $regex: `^${targetMonth}` },
  }).sort({ date: -1 });

  const expenses = logs.filter(l => l.type === 'expense');
  const incomes  = logs.filter(l => l.type === 'income');

  const totalExpenses = expenses.reduce((s, l) => s + l.amount, 0);
  const extraIncome   = incomes.reduce((s, l) => s + l.amount, 0);
  const savings = user.monthlySalary + extraIncome - totalExpenses;

  // Category breakdown for chart
  const categoryBreakdown = {};
  for (const log of expenses) {
    categoryBreakdown[log.category] = (categoryBreakdown[log.category] || 0) + log.amount;
  }

  // Daily spending trend
  const dailySpending = {};
  for (const log of expenses) {
    dailySpending[log.date] = (dailySpending[log.date] || 0) + log.amount;
  }

  const savingsRate = user.monthlySalary > 0
    ? Math.round((savings / user.monthlySalary) * 100)
    : 0;

  res.json({
    success: true,
    month: targetMonth,
    monthlySalary: user.monthlySalary,
    totalExpenses,
    extraIncome,
    savings,
    savingsRate,
    categoryBreakdown,
    dailySpending,
    logs,
  });
};

// @desc  Get money history (last N months)
// @route GET /api/money/history
const getMoneyHistory = async (req, res) => {
  const { months = 3 } = req.query;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - Number(months));
  const startStr = startDate.toISOString().split('T')[0];

  const logs = await MoneyLog.find({
    user: req.user._id,
    date: { $gte: startStr },
  }).sort({ date: -1 });

  res.json({ success: true, logs, count: logs.length });
};

// @desc  Delete a money log entry
// @route DELETE /api/money/:id
const deleteMoney = async (req, res) => {
  const log = await MoneyLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Entry not found');
  }
  if (log.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this entry');
  }
  await log.deleteOne();
  res.json({ success: true, message: 'Entry deleted' });
};

module.exports = { logMoney, getTodayMoney, getMonthlySummaryRoute, getMoneyHistory, deleteMoney };
