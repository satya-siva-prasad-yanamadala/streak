const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Express v5 handles async errors natively — no asyncHandler needed
router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refreshToken);
router.post('/logout',   protect, logout);
router.get('/profile',   protect, getProfile);
router.put('/profile',   protect, updateProfile);

module.exports = router;
