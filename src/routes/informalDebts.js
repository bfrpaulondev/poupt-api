const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listar, criar, atualizar, eliminar, registarPagamento } = require('../controllers/informalDebtController');

router.get('/', protect, listar);
router.post('/', protect, criar);
router.put('/:id', protect, atualizar);
router.delete('/:id', protect, eliminar);
router.post('/:id/payment', protect, registarPagamento);

module.exports = router;
