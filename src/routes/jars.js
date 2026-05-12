const express = require('express');
const router = express.Router();
const { obterFrascos, atualizarFrasco } = require('../controllers/jarController');
const proteger = require('../middleware/auth');

router.get('/', proteger, obterFrascos);
router.put('/:id', proteger, atualizarFrasco);

module.exports = router;
