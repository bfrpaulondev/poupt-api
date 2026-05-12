const User = require('../models/User');
const PoupMoeda = require('../models/PoupMoeda');

exports.obterSaldo = async (req, res, next) => {
  try {
    const utilizador = await User.findById(req.user._id);

    let contaMoedas = await PoupMoeda.findOne({ userId: req.user._id });
    if (!contaMoedas) {
      contaMoedas = await PoupMoeda.create({
        userId: req.user._id,
        balance: utilizador.poupMoedas,
      });
    }

    res.json({
      success: true,
      data: {
        saldo: utilizador.poupMoedas,
        historico: contaMoedas.transactions.slice(-20),
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.ganhar = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const montante = 50;

    const utilizador = await User.findById(req.user._id);
    utilizador.poupMoedas += montante;
    await utilizador.save({ validateBeforeSave: false });

    let contaMoedas = await PoupMoeda.findOne({ userId: req.user._id });
    if (!contaMoedas) {
      contaMoedas = await PoupMoeda.create({
        userId: req.user._id,
        balance: utilizador.poupMoedas,
      });
    }

    contaMoedas.transactions.push({
      type: 'ganho',
      amount: montante,
      reason: reason || 'Visualizacao de anuncio',
    });
    contaMoedas.balance = utilizador.poupMoedas;
    await contaMoedas.save();

    res.json({
      success: true,
      data: {
        saldo: utilizador.poupMoedas,
        ganho: montante,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.gastar = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Montante invalido' });
    }

    const utilizador = await User.findById(req.user._id);

    if (utilizador.poupMoedas < amount) {
      return res.status(400).json({
        success: false,
        error: 'Saldo insuficiente de PoupMoedas',
        saldoAtual: utilizador.poupMoedas,
      });
    }

    utilizador.poupMoedas -= amount;
    await utilizador.save({ validateBeforeSave: false });

    let contaMoedas = await PoupMoeda.findOne({ userId: req.user._id });
    if (!contaMoedas) {
      contaMoedas = await PoupMoeda.create({
        userId: req.user._id,
        balance: utilizador.poupMoedas,
      });
    }

    contaMoedas.transactions.push({
      type: 'gasto',
      amount,
      reason: reason || 'Utilizacao de funcionalidade',
    });
    contaMoedas.balance = utilizador.poupMoedas;
    await contaMoedas.save();

    res.json({
      success: true,
      data: {
        saldo: utilizador.poupMoedas,
        gasto: amount,
      },
    });
  } catch (erro) {
    next(erro);
  }
};
