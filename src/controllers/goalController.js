const Goal = require('../models/Goal');
const { validarObjetivo } = require('../utils/validators');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user._id };

    if (req.query.type) filtros.type = req.query.type;

    const total = await Goal.countDocuments(filtros);
    const objetivos = await Goal.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: objetivos,
      paginacao: { page, limit, total, paginas: Math.ceil(total / limit) },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const erros = validarObjetivo(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const objetivo = await Goal.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: objetivo });
  } catch (erro) {
    next(erro);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    let objetivo = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!objetivo) {
      return res.status(404).json({ success: false, error: 'Objetivo nao encontrado' });
    }

    objetivo = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: objetivo });
  } catch (erro) {
    next(erro);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const objetivo = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!objetivo) {
      return res.status(404).json({ success: false, error: 'Objetivo nao encontrado' });
    }

    await objetivo.deleteOne();

    res.json({ success: true, data: {} });
  } catch (erro) {
    next(erro);
  }
};
