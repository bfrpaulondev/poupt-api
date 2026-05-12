const express = require('express');
const router = express.Router();
const { getBalance, earnMoedas, spendMoedas } = require('../controllers/moedaController');

router.get('/balance', getBalance);
router.post('/earn', earnMoedas);
router.post('/spend', spendMoedas);

module.exports = router;
