const express = require('express');
const router = express.Router();
const { protect, premiumOnly } = require('../middleware/auth');
const {
  getInteractions, createInteraction,
  updateInteraction, addHistoryEntry
} = require('../controllers/creditorController');

router.get('/', protect, premiumOnly, getInteractions);
router.post('/', protect, premiumOnly, createInteraction);
router.put('/:id', protect, premiumOnly, updateInteraction);
router.post('/:id/history', protect, premiumOnly, addHistoryEntry);

module.exports = router;
