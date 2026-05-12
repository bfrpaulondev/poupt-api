const Notification = require('../models/Notification');
const { paginacao } = require('../utils/helpers');

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginacao(req.query);
    const filtros = { userId: req.user._id };

    if (req.query.read !== undefined) {
      filtros.read = req.query.read === 'true';
    }

    if (req.query.type) filtros.type = req.query.type;

    const total = await Notification.countDocuments(filtros);
    const notificacoes = await Notification.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const naoLidas = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      data: notificacoes,
      naoLidas,
      paginacao: { page, limit, total, paginas: Math.ceil(total / limit) },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.marcarComoLida = async (req, res, next) => {
  try {
    const notificacao = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notificacao) {
      return res.status(404).json({ success: false, error: 'Notificacao nao encontrada' });
    }

    notificacao.read = true;
    await notificacao.save();

    res.json({ success: true, data: notificacao });
  } catch (erro) {
    next(erro);
  }
};
