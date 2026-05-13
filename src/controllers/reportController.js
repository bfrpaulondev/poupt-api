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
        totalIncome: +income.toFixed(2),
        totalExpenses: +expenses.toFixed(2),
        balance: +(income - expenses).toFixed(2),
        available: +(income - expenses).toFixed(2),
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

    const user = await User.findById(req.user.id);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const incomeTxns = transactions.filter(t => t.type === 'receita');
    const expenseTxns = transactions.filter(t => t.type === 'despesa');

    const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTxns.reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown as array (frontend expects this format)
    const byCategory = {};
    expenseTxns.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    const categoryBreakdown = Object.entries(byCategory).map(([category, total]) => ({
      category,
      total: +total.toFixed(2)
    }));

    // Monthly breakdown for the last 6 months (for bar chart)
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      let bm = m - i;
      let by = y;
      while (bm <= 0) { bm += 12; by--; }
      const bStart = new Date(by, bm - 1, 1);
      const bEnd = new Date(by, bm, 0, 23, 59, 59);
      const bTxns = await Transaction.find({
        userId: req.user.id,
        date: { $gte: bStart, $lte: bEnd }
      });
      const bIncome = bTxns.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
      const bExpenses = bTxns.filter(t => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);
      monthlyBreakdown.push({
        month: new Date(by, bm - 1).toLocaleDateString('pt-PT', { month: 'short' }),
        income: +bIncome.toFixed(2),
        expenses: +bExpenses.toFixed(2)
      });
    }

    // Jars allocation
    const jarPercentages = user.jarPercentages || { necessities: 50, freedom: 10, savings: 10, education: 10, play: 10, give: 10 };
    const jarsAllocation = Object.entries(jarPercentages).map(([jar, percentage]) => ({
      jar,
      name: { necessities: 'Necessidades', freedom: 'Liberdade', savings: 'Poupanca', education: 'Educacao', play: 'Lazer', give: 'Doar' }[jar] || jar,
      percentage,
      value: +(user.income * percentage / 100).toFixed(2)
    }));

    // Savings rate trend for last 6 months
    const savingsRateTrend = monthlyBreakdown.map(m => ({
      month: m.month,
      rate: m.income > 0 ? +((m.income - m.expenses) / m.income * 100).toFixed(1) : 0
    }));

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
        categoryBreakdown,
        monthlyBreakdown,
        jarsAllocation,
        savingsRateTrend,
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

exports.exportCSV = async (req, res) => {
  try {
    const { type = 'transactions', month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    if (type === 'transactions') {
      const transactions = await Transaction.find({
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });

      const headers = 'Data,Tipo,Categoria,Descricao,Montante,Frasco\n';
      const rows = transactions.map(t =>
        `${new Date(t.date).toLocaleDateString('pt-PT')},${t.type},${t.category},"${t.description}",${t.amount},${t.jar || ''}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=transacoes_${m}_${y}.csv`);
      return res.send('\uFEFF' + headers + rows); // BOM for Excel
    }

    if (type === 'debts') {
      const debts = await Debt.find({ userId: req.user.id }).sort('amount');
      const headers = 'Creditor,Montante,Pago,Restante,Taxa,Estado\n';
      const rows = debts.map(d =>
        `"${d.creditorName}",${d.amount},${d.amountPaid},${d.remainingAmount},${d.interestRate || 0}%,${d.status}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=dividas.csv`);
      return res.send('\uFEFF' + headers + rows);
    }

    if (type === 'goals') {
      const goals = await Goal.find({ userId: req.user.id });
      const headers = 'Nome,Tipo,Alvo,Atual,Progresso,Prazo\n';
      const rows = goals.map(g =>
        `"${g.name}",${g.type},${g.targetAmount},${g.currentAmount},${g.targetAmount > 0 ? (g.currentAmount / g.targetAmount * 100).toFixed(1) : 0}%,${g.deadline ? new Date(g.deadline).toLocaleDateString('pt-PT') : ''}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=metas.csv`);
      return res.send('\uFEFF' + headers + rows);
    }

    res.status(400).json({ success: false, error: 'Tipo de exportacao invalido' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
