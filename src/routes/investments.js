const express = require('express');
const router = express.Router();
const { protect, premiumOnly } = require('../middleware/auth');
const {
  getInvestments, createInvestment,
  updateInvestment, deleteInvestment
} = require('../controllers/investmentController');

router.get('/', protect, getInvestments);
router.post('/', protect, premiumOnly, createInvestment);
router.put('/:id', protect, premiumOnly, updateInvestment);
router.delete('/:id', protect, premiumOnly, deleteInvestment);

module.exports = router;
