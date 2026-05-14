const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      jar,
      sort = '-date'
    } = req.query;

    const query = { userId: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (jar) query.jar = jar;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: { transactions },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    // Whitelist allowed fields
    const { type, amount, category, description, jar, date, isRecurring, recurringFrequency, notes, tags } = req.body;
    const transaction = await Transaction.create({
      type, amount, category, description, jar, date, isRecurring, recurringFrequency, notes, tags,
      userId: req.user.id
    });

    const user = await User.findById(req.user.id);
    user.xp = (user.xp || 0) + 5;
    user.streak = user.streak || 0;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      data: { transaction }
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

exports.updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, jar, date, isRecurring, recurringFrequency, notes, tags } = req.body;
    const updateData = { type, amount, category, description, jar, date, isRecurring, recurringFrequency, notes, tags };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacao nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
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

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacao nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transacao eliminada'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { receita: 0, despesa: 0 };
      }
      byCategory[t.category][t.type] += t.amount;
    });

    const byJar = {};
    transactions.filter(t => t.jar).forEach(t => {
      if (!byJar[t.jar]) byJar[t.jar] = 0;
      byJar[t.jar] += t.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        income: +income.toFixed(2),
        expenses: +expenses.toFixed(2),
        balance: +(income - expenses).toFixed(2),
        byCategory,
        byJar,
        transactionCount: transactions.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
