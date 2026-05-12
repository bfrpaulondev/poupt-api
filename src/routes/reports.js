const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSummary, getMonthly, getDebtProgress } = require('../controllers/reportController');

router.get('/summary', protect, getSummary);
router.get('/monthly', protect, getMonthly);
router.get('/debt-progress', protect, getDebtProgress);

module.exports = router;
