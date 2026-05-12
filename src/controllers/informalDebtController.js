const InformalDebt = require('../models/InformalDebt');
const { validarDividaInformal } = require('../utils/validators');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user._id };

    if (req.query.status) filtros.status = req.query.status;

    const total = await InformalDebt.countDocuments(filtros);
    const dividas = await InformalDebt.find(filtros)
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
    const erros = validarDividaInformal(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const divida = await InformalDebt.create({
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
    let divida = await InformalDebt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida informal nao encontrada' });
    }

    divida = await InformalDebt.findByIdAndUpdate(req.params.id, req.body, {
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
    const divida = await InformalDebt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida informal nao encontrada' });
    }

    await divida.deleteOne();

    res.json({ success: true, data: {} });
  } catch (erro) {
    next(erro);
  }
};

exports.registarPagamento = async (req, res, next) => {
  try {
    const divida = await InformalDebt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida informal nao encontrada' });
    }

    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Montante do pagamento deve ser maior que zero' });
    }

    divida.payments.push({
      amount,
      date: new Date(),
      note: note || '',
    });

    divida.amountPaid += amount;

    if (divida.amountPaid >= divida.amount) {
      divida.status = 'pago';
    } else if (divida.amountPaid > 0) {
      divida.status = 'parcial';
    }

    await divida.save();

    res.json({ success: true, data: divida });
  } catch (erro) {
    next(erro);
  }
};
