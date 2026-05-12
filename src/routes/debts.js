const express = require('express');
const router = express.Router();
const {
  getDebts, createDebt, updateDebt, deleteDebt,
  addPayment, snowballOrder,
  getInformalDebts, createInformalDebt, addInformalPayment
} = require('../controllers/debtController');

router.get('/', getDebts);
router.post('/', createDebt);
router.put('/:id', updateDebt);
router.delete('/:id', deleteDebt);
router.post('/:id/payment', addPayment);
router.get('/snowball', snowballOrder);
router.get('/informal', getInformalDebts);
router.post('/informal', createInformalDebt);
router.post('/informal/:id/payment', addInformalPayment);

module.exports = router;
