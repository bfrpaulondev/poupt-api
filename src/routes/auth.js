const express = require('express');
const router = express.Router();
const { registar, login, googleAuth, logout, obterPerfil } = require('../controllers/authController');
const proteger = require('../middleware/auth');

router.post('/register', registar);
router.post('/login', login);
router.post('/google-auth', googleAuth);
router.post('/logout', logout);
router.get('/me', proteger, obterPerfil);

module.exports = router;
