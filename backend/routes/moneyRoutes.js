const express = require('express');
const router = express.Router();
const { logMoney, getTodayMoney, getMonthlySummaryRoute, getMoneyHistory, deleteMoney } = require('../controllers/moneyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Express v5 handles async errors natively
router.post('/log',        logMoney);
router.get('/today',       getTodayMoney);
router.get('/monthly',     getMonthlySummaryRoute);
router.get('/history',     getMoneyHistory);
router.delete('/:id',      deleteMoney);

module.exports = router;
