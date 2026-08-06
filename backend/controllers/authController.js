const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { calculateDailyTargets } = require('../services/nutritionService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth/refresh',
  });
};

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
  const {
    name, email, password,
    weight, height, age, gender,
    activityLevel, fitnessGoal,
    monthlySalary,
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !weight || !height || !age || !gender || !activityLevel || !fitnessGoal) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Calculate daily nutrition targets
  const targets = calculateDailyTargets({
    weight: Number(weight),
    height: Number(height),
    age: Number(age),
    gender,
    activityLevel,
    fitnessGoal,
  });

  const user = await User.create({
    name,
    email,
    password,
    weight: Number(weight),
    height: Number(height),
    age: Number(age),
    gender,
    activityLevel,
    fitnessGoal,
    monthlySalary: Number(monthlySalary) || 0,
    ...targets,
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    user: user.toJSON(),
    accessToken,
    targets,
  });
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  setCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    message: 'Login successful!',
    user: user.toJSON(),
    accessToken,
  });
};

// @desc  Refresh access token
// @route POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    setCookies(res, accessToken, newRefreshToken);

    res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @desc  Logout
// @route POST /api/auth/logout
const logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc  Get current user profile
// @route GET /api/auth/profile
const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  const { name, weight, height, age, gender, activityLevel, fitnessGoal, monthlySalary } = req.body;

  if (name) user.name = name;
  if (monthlySalary !== undefined) user.monthlySalary = Number(monthlySalary);

  // Recalculate targets if physical profile changes
  const physicalChanged = weight || height || age || gender || activityLevel || fitnessGoal;
  if (physicalChanged) {
    if (weight) user.weight = Number(weight);
    if (height) user.height = Number(height);
    if (age) user.age = Number(age);
    if (gender) user.gender = gender;
    if (activityLevel) user.activityLevel = activityLevel;
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;

    const targets = calculateDailyTargets({
      weight: user.weight, height: user.height, age: user.age,
      gender: user.gender, activityLevel: user.activityLevel, fitnessGoal: user.fitnessGoal,
    });
    Object.assign(user, targets);
  }

  await user.save();
  res.json({ success: true, message: 'Profile updated!', user: user.toJSON() });
};

module.exports = { register, login, refreshToken, logout, getProfile, updateProfile };
