const express = require('express');
const router = express.Router();
const { enviarMensagem, obterHistorico } = require('../controllers/coachController');
const proteger = require('../middleware/auth');

router.post('/chat', proteger, enviarMensagem);
router.get('/history', proteger, obterHistorico);

module.exports = router;
