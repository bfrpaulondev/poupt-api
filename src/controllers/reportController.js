const Transaction = require('../models/Transaction');
const Debt = require('../models/Debt');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');
const User = require('../models/User');

exports.getSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startOfMonth }
    });

    const debts = await Debt.find({ userId: req.user.id, status: { $ne: 'pago' } });

    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebt = debts.reduce((sum, d) => sum + (d.amount - d.amountPaid), 0);
    const overdueDebts = debts.filter(d => d.daysOverdue > 0);

    let investmentData = null;
    if (['crescimento', 'prosperidade'].includes(user.financialMode)) {
      const investments = await Investment.find({ userId: req.user.id });
      const totalInvested = investments.reduce((s, i) => s + i.totalInvested, 0);
      const currentVal = investments.reduce((s, i) => s + i.currentValue, 0);
      investmentData = {
        totalInvested,
        currentValue: currentVal,
        profitLoss: currentVal - totalInvested,
        count: investments.length
      };
    }

    res.status(200).json({
      success: true,
      data: {
        financialMode: user.financialMode,
        income: +income.toFixed(2),
        expenses: +expenses.toFixed(2),
        balance: +(income - expenses).toFixed(2),
        totalDebt: +totalDebt.toFixed(2),
        overdueDebts: overdueDebts.length,
        poupMoedas: user.poupMoedas,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        jarAllocations: user.jarAllocations,
        jarPercentages: user.jarPercentages,
        investmentData
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getMonthly = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const income = transactions.filter(t => t.type === 'receita');
    const expenses = transactions.filter(t => t.type === 'despesa');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    const byCategory = {};
    expenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const dailySpending = {};
    expenses.forEach(t => {
      const day = t.date.toISOString().split('T')[0];
      dailySpending[day] = (dailySpending[day] || 0) + t.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        month: m,
        year: y,
        totalIncome: +totalIncome.toFixed(2),
        totalExpenses: +totalExpenses.toFixed(2),
        savings: +(totalIncome - totalExpenses).toFixed(2),
        savingsRate: totalIncome > 0
          ? +((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)
          : 0,
        byCategory,
        dailySpending,
        transactionCount: transactions.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getDebtProgress = async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user.id }).sort('amount');

    const totalOriginal = debts.reduce((sum, d) => sum + d.amount, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.amountPaid, 0);
    const totalRemaining = totalOriginal - totalPaid;

    const progress = debts.map(d => ({
      id: d._id,
      creditor: d.creditorName,
      type: d.type,
      original: d.amount,
      paid: d.amountPaid,
      remaining: d.remainingAmount,
      progress: d.amount > 0 ? +(d.amountPaid / d.amount * 100).toFixed(1) : 0,
      daysOverdue: d.daysOverdue,
      status: d.status
    }));

    res.status(200).json({
      success: true,
      data: {
        totalOriginal: +totalOriginal.toFixed(2),
        totalPaid: +totalPaid.toFixed(2),
        totalRemaining: +totalRemaining.toFixed(2),
        overallProgress: totalOriginal > 0
          ? +(totalPaid / totalOriginal * 100).toFixed(1)
          : 0,
        debts: progress
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
