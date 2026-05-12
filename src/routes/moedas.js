const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBalance, earnMoedas, spendMoedas } = require('../controllers/moedaController');

router.get('/balance', protect, getBalance);
router.post('/earn', protect, earnMoedas);
router.post('/spend', protect, spendMoedas);

module.exports = router;
