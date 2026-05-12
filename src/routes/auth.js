const express = require('express');
const router = express.Router();
const {
  register, login, googleAuth, logout,
  getMe, updateMe, updateMode, updateCoach,
  completeOnboarding, deleteMe
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google-auth', googleAuth);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/mode', updateMode);
router.put('/me/coach', updateCoach);
router.put('/me/onboarding', completeOnboarding);
router.delete('/me', deleteMe);

module.exports = router;
