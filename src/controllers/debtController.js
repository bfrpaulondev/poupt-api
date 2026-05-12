const Debt = require('../models/Debt');
const { validarDivida } = require('../utils/validators');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user._id };

    if (req.query.status) filtros.status = req.query.status;
    if (req.query.type) filtros.type = req.query.type;

    const total = await Debt.countDocuments(filtros);
    const dividas = await Debt.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: dividas,
      paginacao: { page, limit, total, paginas: Math.ceil(total / limit) },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const erros = validarDivida(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const divida = await Debt.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: divida });
  } catch (erro) {
    next(erro);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    let divida = await Debt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida nao encontrada' });
    }

    divida = await Debt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: divida });
  } catch (erro) {
    next(erro);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const divida = await Debt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida nao encontrada' });
    }

    await divida.deleteOne();

    res.json({ success: true, data: {} });
  } catch (erro) {
    next(erro);
  }
};
