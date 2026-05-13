const express = require('express');
const router = express.Router();
const { obterPerfil, atualizarPerfil, alterarModo, configurarCoach } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, obterPerfil);
router.put('/me', protect, atualizarPerfil);
router.put('/me/mode', protect, alterarModo);
router.put('/me/coach', protect, configurarCoach);

module.exports = router;
