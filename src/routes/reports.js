const express = require('express');
const router = express.Router();
const { resumo, mensal, progressoDividas } = require('../controllers/reportController');
const proteger = require('../middleware/auth');

router.get('/summary', proteger, resumo);
router.get('/monthly', proteger, mensal);
router.get('/debt-progress', proteger, progressoDividas);

module.exports = router;
