const Investment = require('../models/Investment');
const { validarInvestimento } = require('../utils/validators');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user._id };

    if (req.query.type) filtros.type = req.query.type;

    const total = await Investment.countDocuments(filtros);
    const investimentos = await Investment.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: investimentos,
      paginacao: { page, limit, total, paginas: Math.ceil(total / limit) },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const erros = validarInvestimento(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const investimento = await Investment.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: investimento });
  } catch (erro) {
    next(erro);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    let investimento = await Investment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!investimento) {
      return res.status(404).json({ success: false, error: 'Investimento nao encontrado' });
    }

    investimento = await Investment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: investimento });
  } catch (erro) {
    next(erro);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const investimento = await Investment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!investimento) {
      return res.status(404).json({ success: false, error: 'Investimento nao encontrado' });
    }

    await investimento.deleteOne();

    res.json({ success: true, data: {} });
  } catch (erro) {
    next(erro);
  }
};
