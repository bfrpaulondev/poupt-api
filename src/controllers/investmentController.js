const Investment = require('../models/Investment');

exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id }).sort('-createdAt');

    const totalInvested = investments.reduce((sum, i) => sum + i.totalInvested, 0);
    const currentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const totalDividends = investments.reduce((sum, i) => sum + i.dividends, 0);

    res.status(200).json({
      success: true,
      data: {
        investments,
        portfolio: {
          totalInvested: +totalInvested.toFixed(2),
          currentValue: +currentValue.toFixed(2),
          totalProfitLoss: +(currentValue - totalInvested).toFixed(2),
          totalDividends: +totalDividends.toFixed(2)
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

exports.createInvestment = async (req, res) => {
  try {
    const { name, type, quantity, avgPrice, currentPrice, dividends, platform, currency, buyDate, notes } = req.body;
    const investment = await Investment.create({
      name, type, quantity, avgPrice, currentPrice, dividends, platform, currency, buyDate, notes,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { investment }
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

exports.updateInvestment = async (req, res) => {
  try {
    const { name, type, quantity, avgPrice, currentPrice, dividends, platform, currency, buyDate, notes } = req.body;
    const updateData = { name, type, quantity, avgPrice, currentPrice, dividends, platform, currency, buyDate, notes };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investimento nao encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { investment }
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

exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investimento nao encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Investimento eliminado'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
