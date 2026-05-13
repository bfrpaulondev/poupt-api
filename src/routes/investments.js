const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getInvestments, createInvestment,
  updateInvestment, deleteInvestment
} = require('../controllers/investmentController');

router.get('/', protect, getInvestments);
router.post('/', protect, createInvestment);
router.put('/:id', protect, updateInvestment);
router.delete('/:id', protect, deleteInvestment);

module.exports = router;
