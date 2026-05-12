const express = require('express');
const router = express.Router();
const {
  getGoals, createGoal, updateGoal,
  deleteGoal, updateGoalProgress
} = require('../controllers/goalController');

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/progress', updateGoalProgress);

module.exports = router;
