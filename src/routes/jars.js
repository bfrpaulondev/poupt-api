const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { obterFrascos, atualizarFrasco } = require('../controllers/jarController');

router.get('/', protect, obterFrascos);
router.put('/:id', protect, atualizarFrasco);

module.exports = router;
