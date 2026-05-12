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
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.createInvestment = async (req, res) => {
  try {
    const investment = await Investment.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { investment }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
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
    res.status(400).json({
      success: false,
      error: err.message
    });
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
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
