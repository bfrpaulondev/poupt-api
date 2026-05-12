const express = require('express');
const router = express.Router();
const { obterSaldo, ganhar, gastar } = require('../controllers/moedaController');
const proteger = require('../middleware/auth');

router.get('/balance', proteger, obterSaldo);
router.post('/earn', proteger, ganhar);
router.post('/spend', proteger, gastar);

module.exports = router;
