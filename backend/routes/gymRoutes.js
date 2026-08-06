const express = require('express');
const router = express.Router();
const { logFood, getTodayLog, getGymHistory, getWeeklySummary } = require('../controllers/gymController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Express v5 handles async errors natively
router.post('/log',        logFood);
router.get('/today',       getTodayLog);
router.get('/history',     getGymHistory);
router.get('/weekly',      getWeeklySummary);

module.exports = router;
