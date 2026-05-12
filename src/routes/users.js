const express = require('express');
const router = express.Router();
const { obterPerfil, atualizarPerfil, alterarModo, configurarCoach } = require('../controllers/userController');
const proteger = require('../middleware/auth');

router.get('/me', proteger, obterPerfil);
router.put('/me', proteger, atualizarPerfil);
router.put('/me/mode', proteger, alterarModo);
router.put('/me/coach', proteger, configurarCoach);

module.exports = router;
