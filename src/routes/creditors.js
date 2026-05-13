const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getInteractions, createInteraction,
  updateInteraction, addHistoryEntry
} = require('../controllers/creditorController');

router.get('/', protect, getInteractions);
router.post('/', protect, createInteraction);
router.put('/:id', protect, updateInteraction);
router.post('/:id/history', protect, addHistoryEntry);

module.exports = router;
