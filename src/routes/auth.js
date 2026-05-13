const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register, login, googleAuth, logout,
  getMe, updateMe, updateMode, detectMode, updateCoach,
  completeOnboarding, deleteMe,
  forgotPassword, resetPassword
} = require('../controllers/authController');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google-auth', authLimiter, googleAuth);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/mode', protect, updateMode);
router.post('/me/detect-mode', protect, detectMode);
router.put('/me/coach', protect, updateCoach);
router.put('/me/onboarding', protect, completeOnboarding);
router.delete('/me', protect, deleteMe);

module.exports = router;
