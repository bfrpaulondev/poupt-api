const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, googleAuth, logout,
  getMe, updateMe, updateMode, updateCoach,
  completeOnboarding, deleteMe
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google-auth', googleAuth);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/mode', protect, updateMode);
router.put('/me/coach', protect, updateCoach);
router.put('/me/onboarding', protect, completeOnboarding);
router.delete('/me', protect, deleteMe);

module.exports = router;
