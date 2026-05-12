const express = require('express');
const router = express.Router();
const { listar, criar, atualizar, eliminar, registarPagamento } = require('../controllers/informalDebtController');
const proteger = require('../middleware/auth');

router.get('/', proteger, listar);
router.post('/', proteger, criar);
router.put('/:id', proteger, atualizar);
router.delete('/:id', proteger, eliminar);
router.post('/:id/payment', proteger, registarPagamento);

module.exports = router;
