const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { goals }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { goal }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Meta nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: { goal }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Meta nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meta eliminada'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Meta nao encontrada'
      });
    }

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.currentAmount = goal.targetAmount;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: { goal }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
