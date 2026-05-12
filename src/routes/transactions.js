const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransactions, createTransaction,
  updateTransaction, deleteTransaction, getSummary
} = require('../controllers/transactionController');

router.get('/', protect, getTransactions);
router.get('/summary', protect, getSummary);
router.post('/', protect, createTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
