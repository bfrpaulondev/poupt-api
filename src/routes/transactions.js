const express = require('express');
const router = express.Router();
const {
  getTransactions, createTransaction,
  updateTransaction, deleteTransaction, getSummary
} = require('../controllers/transactionController');

router.get('/', getTransactions);
router.get('/summary', getSummary);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
