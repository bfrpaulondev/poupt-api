const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chat, getHistory, clearHistory } = require('../controllers/coachController');

router.post('/chat', protect, chat);
router.get('/history', protect, getHistory);
router.delete('/history', protect, clearHistory);

module.exports = router;
