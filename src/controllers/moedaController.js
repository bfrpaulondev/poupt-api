const User = require('../models/User');

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: { balance: user.poupMoedas }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.earnMoedas = async (req, res) => {
  try {
    const { action, amount } = req.body;

    const validActions = {
      watch_ad: 50,
      daily_login: 10,
      add_transaction: 5,
      complete_challenge: 100,
      streak_bonus: 30,
      share_achievement: 20
    };

    const earned = amount || validActions[action] || 0;

    if (earned <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Acao invalida'
      });
    }

    const user = await User.findById(req.user.id);
    user.poupMoedas += earned;
    user.xp = (user.xp || 0) + Math.floor(earned / 5);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        balance: user.poupMoedas,
        earned
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.spendMoedas = async (req, res) => {
  try {
    const { feature } = req.body;

    const prices = {
      coach_question: 100,
      ocr_scan: 50,
      weekly_report: 30,
      creditor_template: 10,
      premium_theme: 200
    };

    const cost = prices[feature];
    if (!cost) {
      return res.status(400).json({
        success: false,
        error: 'Funcionalidade invalida'
      });
    }

    const user = await User.findById(req.user.id);
    if (user.poupMoedas < cost) {
      return res.status(400).json({
        success: false,
        error: 'PoupMoedas insuficientes',
        balance: user.poupMoedas,
        cost
      });
    }

    user.poupMoedas -= cost;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        balance: user.poupMoedas,
        spent: cost,
        feature
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
