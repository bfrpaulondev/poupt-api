const Debt = require('../models/Debt');
const { calcularBolaDeNeve } = require('../services/snowball');
const { notifyDebtPaid } = require('../services/notificationGenerator');

exports.getDebts = async (req, res) => {
  try {
    const { type, status, sort = 'snowballPriority' } = req.query;
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const debts = await Debt.find(query).sort(sort);

    const totalOwed = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.amountPaid, 0);
    const overdueCount = debts.filter(d => d.daysOverdue > 0).length;

    res.status(200).json({
      success: true,
      data: {
        debts,
        summary: {
          totalDebts: debts.length,
          totalOwed: +totalOwed.toFixed(2),
          totalPaid: +totalPaid.toFixed(2),
          overdueCount
        }
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

exports.createDebt = async (req, res) => {
  try {
    // Whitelist allowed fields
    const { type, creditorName, amount, interestRate, minimumPayment, dueDate, startDate, status, relationshipType, contactInfo, notes } = req.body;
    const debt = await Debt.create({
      type, creditorName, amount, interestRate, minimumPayment, dueDate, startDate, status, relationshipType, contactInfo, notes,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { debt }
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

exports.updateDebt = async (req, res) => {
  try {
    const { type, creditorName, amount, interestRate, minimumPayment, dueDate, startDate, status, relationshipType, contactInfo, notes } = req.body;
    const updateData = { type, creditorName, amount, interestRate, minimumPayment, dueDate, startDate, status, relationshipType, contactInfo, notes };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Divida nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: { debt }
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

exports.deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Divida nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Divida eliminada'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, notes } = req.body;

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Divida nao encontrada'
      });
    }

    debt.amountPaid += amount;
    debt.payments.push({ amount, notes });

    const eraPago = debt.amountPaid >= debt.amount;

    if (debt.amountPaid >= debt.amount) {
      debt.status = 'pago';
      debt.amountPaid = debt.amount;
    } else {
      debt.status = 'parcial';
    }

    await debt.save();

    // Notificar quando divida e paga
    if (debt.status === 'pago' && !eraPago) {
      await notifyDebtPaid(req.user.id, debt);
    }

    res.status(200).json({
      success: true,
      data: { debt }
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

exports.snowballOrder = async (req, res) => {
  try {
    const debts = await Debt.find({
      userId: req.user.id,
      status: { $ne: 'pago' }
    });

    const sorted = debts.sort((a, b) => a.amount - b.amount);

    let remainingBudget = req.body.extraBudget || 0;
    const plan = sorted.map((debt, index) => {
      const minPayment = debt.minimumPayment || 0;
      const extra = index === 0 ? remainingBudget : 0;
      const totalPayment = minPayment + extra;

      return {
        debt: debt._id,
        creditorName: debt.creditorName,
        totalAmount: debt.amount,
        remaining: debt.remainingAmount,
        minimumPayment: minPayment,
        extraPayment: extra,
        totalPayment,
        monthsToPayoff: minPayment > 0
          ? Math.ceil((debt.remainingAmount - extra) / minPayment)
          : 0,
        priority: index + 1
      };
    });

    res.status(200).json({
      success: true,
      data: {
        plan,
        order: plan // Backward compatibility with frontend
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

exports.snowballDetailed = async (req, res) => {
  try {
    const { pagamentoExtra = 0 } = req.body;

    const debts = await Debt.find({
      userId: req.user.id,
      status: { $ne: 'pago' }
    });

    const resultado = calcularBolaDeNeve(debts, pagamentoExtra);

    res.status(200).json({
      success: true,
      data: resultado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.getInformalDebts = async (req, res) => {
  try {
    const debts = await Debt.find({
      userId: req.user.id,
      type: 'informal'
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: { debts }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.createInformalDebt = async (req, res) => {
  try {
    // Whitelist allowed fields
    const { creditorName, amount, loanDate, returnDate, interestRate, status, notes, relationshipType, dueDate } = req.body;
    const debt = await Debt.create({
      creditorName, amount, loanDate, returnDate, interestRate, status, notes, relationshipType, dueDate,
      userId: req.user.id,
      type: 'informal'
    });

    res.status(201).json({
      success: true,
      data: { debt }
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

exports.addInformalPayment = async (req, res) => {
  try {
    const { amount, notes } = req.body;

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user.id,
      type: 'informal'
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Divida informal nao encontrada'
      });
    }

    debt.amountPaid += amount;
    debt.payments.push({ amount, notes });

    if (debt.amountPaid >= debt.amount) {
      debt.status = 'pago';
    } else {
      debt.status = 'parcial';
    }

    await debt.save();

    res.status(200).json({
      success: true,
      data: { debt }
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
