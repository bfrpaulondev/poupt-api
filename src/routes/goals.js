const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGoals, createGoal, updateGoal,
  deleteGoal, updateGoalProgress
} = require('../controllers/goalController');

router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);
router.post('/:id/progress', protect, updateGoalProgress);

module.exports = router;
