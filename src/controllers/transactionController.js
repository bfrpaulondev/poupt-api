const Transaction = require('../models/Transaction');
const { validarTransacao } = require('../utils/validators');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user._id };

    if (req.query.type) filtros.type = req.query.type;
    if (req.query.category) filtros.category = req.query.category;
    if (req.query.jar) filtros.jar = req.query.jar;

    if (req.query.dataInicio || req.query.dataFim) {
      filtros.date = {};
      if (req.query.dataInicio) filtros.date.$gte = new Date(req.query.dataInicio);
      if (req.query.dataFim) filtros.date.$lte = new Date(req.query.dataFim);
    }

    const total = await Transaction.countDocuments(filtros);
    const transacoes = await Transaction.find(filtros)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: transacoes,
      paginacao: {
        page,
        limit,
        total,
        paginas: Math.ceil(total / limit),
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const erros = validarTransacao(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const transacao = await Transaction.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: transacao });
  } catch (erro) {
    next(erro);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    let transacao = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transacao) {
      return res.status(404).json({ success: false, error: 'Transacao nao encontrada' });
    }

    transacao = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: transacao });
  } catch (erro) {
    next(erro);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const transacao = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transacao) {
      return res.status(404).json({ success: false, error: 'Transacao nao encontrada' });
    }

    await transacao.deleteOne();

    res.json({ success: true, data: {} });
  } catch (erro) {
    next(erro);
  }
};
