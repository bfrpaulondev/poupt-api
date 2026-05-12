const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { validarFrascos } = require('../utils/validators');

const JAR_KEYS = ['necessidades', 'liberdade', 'poupanca', 'educacao', 'lazer', 'doar'];

exports.obterFrascos = async (req, res, next) => {
  try {
    const utilizador = await User.findById(req.user._id);

    const transacoes = await Transaction.find({ userId: req.user._id });

    const saldos = {};
    JAR_KEYS.forEach((jar) => {
      const receitas = transacoes
        .filter((t) => t.jar === jar && t.type === 'receita')
        .reduce((soma, t) => soma + t.amount, 0);
      const despesas = transacoes
        .filter((t) => t.jar === jar && t.type === 'despesa')
        .reduce((soma, t) => soma + t.amount, 0);
      saldos[jar] = receitas - despesas;
    });

    const totalReceita = transacoes
      .filter((t) => t.type === 'receita')
      .reduce((soma, t) => soma + t.amount, 0);

    const frascos = JAR_KEYS.map((jar) => ({
      key: jar,
      percentagem: utilizador.jarPercentages[jar],
      saldo: saldos[jar],
      alocação: (totalReceita * utilizador.jarPercentages[jar]) / 100,
    }));

    res.json({
      success: true,
      data: {
        frascos,
        rendimentoTotal: totalReceita,
        percentagens: utilizador.jarPercentages,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.atualizarFrasco = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { percentage } = req.body;

    if (!JAR_KEYS.includes(id)) {
      return res.status(400).json({ success: false, error: 'Frasco invalido' });
    }

    if (percentage === undefined || percentage < 0 || percentage > 100) {
      return res.status(400).json({ success: false, error: 'Percentagem deve ser entre 0 e 100' });
    }

    const utilizador = await User.findById(req.user._id);
    const novasPercentagens = { ...utilizador.jarPercentages.toObject() };
    novasPercentagens[id] = percentage;

    const erroFrascos = validarFrascos(novasPercentagens);
    if (erroFrascos) {
      return res.status(400).json({ success: false, error: erroFrascos });
    }

    utilizador.jarPercentages = novasPercentagens;
    await utilizador.save();

    res.json({ success: true, data: utilizador.jarPercentages });
  } catch (erro) {
    next(erro);
  }
};
