const InformalDebt = require('../models/InformalDebt');
const { validarDividaInformal } = require('../utils/validators');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user.id };

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

exports.criar = async (req, res) => {
  try {
    const erros = validarDividaInformal(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const { creditorName, amount, loanDate, returnDate, interestRate, status, notes, relationshipType, dueDate } = req.body;
    const divida = await InformalDebt.create({
      creditorName, amount, loanDate, returnDate, interestRate, status, notes, relationshipType, dueDate,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: divida });
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

exports.atualizar = async (req, res) => {
  try {
    let divida = await InformalDebt.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida informal nao encontrada' });
    }

    const { creditorName, amount, loanDate, returnDate, interestRate, status, notes, relationshipType, dueDate } = req.body;
    const updateData = { creditorName, amount, loanDate, returnDate, interestRate, status, notes, relationshipType, dueDate };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    divida = await InformalDebt.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: divida });
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

exports.eliminar = async (req, res) => {
  try {
    const divida = await InformalDebt.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!divida) {
      return res.status(404).json({ success: false, error: 'Divida informal nao encontrada' });
    }

    await divida.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

exports.registarPagamento = async (req, res) => {
  try {
    const divida = await InformalDebt.findOne({
      _id: req.params.id,
      userId: req.user.id,
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
