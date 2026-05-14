const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { goals }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.createGoal = async (req, res) => {
  try {
    // Whitelist allowed fields
    const { name, type, targetAmount, currentAmount, deadline, monthlyContribution, icon, color } = req.body;
    const goal = await Goal.create({
      name, type, targetAmount, currentAmount, deadline, monthlyContribution, icon, color,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { goal }
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Registo duplicado' });
    }
    res.status(400).json({ success: false, error: 'Erro ao processar pedido' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { name, type, targetAmount, currentAmount, deadline, monthlyContribution, icon, color } = req.body;
    const updateData = { name, type, targetAmount, currentAmount, deadline, monthlyContribution, icon, color };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
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
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Registo duplicado' });
    }
    res.status(400).json({ success: false, error: 'Erro ao processar pedido' });
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
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
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
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Registo duplicado' });
    }
    res.status(400).json({ success: false, error: 'Erro ao processar pedido' });
  }
};
