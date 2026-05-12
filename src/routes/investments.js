const express = require('express');
const router = express.Router();
const {
  getInvestments, createInvestment,
  updateInvestment, deleteInvestment
} = require('../controllers/investmentController');

router.get('/', getInvestments);
router.post('/', createInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

module.exports = router;
