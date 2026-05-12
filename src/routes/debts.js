const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDebts, createDebt, updateDebt, deleteDebt,
  addPayment, snowballOrder, snowballDetailed,
  getInformalDebts, createInformalDebt, addInformalPayment
} = require('../controllers/debtController');

router.get('/', protect, getDebts);
router.post('/', protect, createDebt);
router.get('/snowball', protect, snowballOrder);
router.post('/snowball/detailed', protect, snowballDetailed);
router.get('/informal', protect, getInformalDebts);
router.post('/informal', protect, createInformalDebt);
router.post('/informal/:id/payment', protect, addInformalPayment);
router.put('/:id', protect, updateDebt);
router.delete('/:id', protect, deleteDebt);
router.post('/:id/payment', protect, addPayment);

module.exports = router;
