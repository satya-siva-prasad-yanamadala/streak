require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const gymRoutes = require('./routes/gymRoutes');
const moneyRoutes = require('./routes/moneyRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth',  authRoutes);
app.use('/api/gym',   gymRoutes);
app.use('/api/money', moneyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🏃 Streak API is running!', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Streak Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Mode: ${process.env.GEMINI_API_KEY ? 'Gemini AI' : 'Rule-based'}\n`);
});
