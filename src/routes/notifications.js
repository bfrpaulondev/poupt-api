const express = require('express');
const router = express.Router();
const { listar, marcarComoLida } = require('../controllers/notificationController');
const proteger = require('../middleware/auth');

router.get('/', proteger, listar);
router.put('/:id/read', proteger, marcarComoLida);

module.exports = router;
