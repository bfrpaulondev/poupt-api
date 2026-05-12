const User = require('../models/User');
const { detectarModo } = require('../services/modeDetector');

exports.obterPerfil = async (req, res, next) => {
  try {
    const utilizador = await User.findById(req.user.id);
    res.json({ success: true, data: utilizador });
  } catch (erro) {
    next(erro);
  }
};

exports.atualizarPerfil = async (req, res, next) => {
  try {
    const camposPermitidos = ['name', 'email', 'avatar', 'income'];
    const dados = {};

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        dados[campo] = req.body[campo];
      }
    });

    if (dados.email) {
      const existente = await User.findOne({ email: dados.email, _id: { $ne: req.user.id } });
      if (existente) {
        return res.status(400).json({ success: false, error: 'Ja existe uma conta com este email' });
      }
    }

    const utilizador = await User.findByIdAndUpdate(req.user.id, dados, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: utilizador });
  } catch (erro) {
    next(erro);
  }
};

exports.alterarModo = async (req, res, next) => {
  try {
    const modoDesejado = req.body.financialMode;

    if (!modoDesejado) {
      return res.status(400).json({ success: false, error: 'Modo financeiro obrigatorio' });
    }

    const modosValidos = ['sobrevivencia', 'recuperacao', 'estabilidade', 'crescimento', 'prosperidade'];
    if (!modosValidos.includes(modoDesejado)) {
      return res.status(400).json({ success: false, error: 'Modo financeiro invalido' });
    }

    const modoDetetado = await detectarModo(req.user.id, req.user.income);

    const utilizador = await User.findByIdAndUpdate(
      req.user.id,
      { financialMode: modoDesejado },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: utilizador,
      modoDetetado,
      aviso: modoDesejado !== modoDetetado
        ? `Com base nos teus dados, o modo sugerido seria "${modoDetetado}". Mudaste manualmente para "${modoDesejado}".`
        : null,
    });
  } catch (erro) {
    next(erro);
  }
};

exports.configurarCoach = async (req, res, next) => {
  try {
    const { coachName, coachGender, coachPersonality } = req.body;
    const dados = {};

    if (coachName !== undefined) dados.coachName = coachName;
    if (coachGender !== undefined) {
      if (!['m', 'f', 'n'].includes(coachGender)) {
        return res.status(400).json({ success: false, error: 'Genero do coach invalido' });
      }
      dados.coachGender = coachGender;
    }
    if (coachPersonality !== undefined) {
      if (!['disciplinado', 'amigavel', 'estrategico', 'espiritual'].includes(coachPersonality)) {
        return res.status(400).json({ success: false, error: 'Personalidade do coach invalida' });
      }
      dados.coachPersonality = coachPersonality;
    }

    const utilizador = await User.findByIdAndUpdate(req.user.id, dados, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: utilizador });
  } catch (erro) {
    next(erro);
  }
};
