const express = require('express');
const router = express.Router();
const { getSummary, getMonthly, getDebtProgress } = require('../controllers/reportController');

router.get('/summary', getSummary);
router.get('/monthly', getMonthly);
router.get('/debt-progress', getDebtProgress);

module.exports = router;
