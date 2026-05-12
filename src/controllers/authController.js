const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { detectarModo } = require('../services/modeDetector');
const { notifyModeTransition, notifyStreakBroken, notifyDailyLogin } = require('../services/notificationGenerator');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  res.cookie('token', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user }
  });
};

// Verificar se duas datas sao o mesmo dia
const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

// Verificar se a data e ontem
const isYesterday = (date) => {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  return isSameDay(date, ontem);
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Este email ja esta registado'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      poupMoedas: 50,
      streak: 1,
      lastLoginDate: new Date()
    });

    createSendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e palavra-passe sao obrigatorios'
      });
    }

    const user = await User.findOne({ email }).select('+password +lastLoginDate');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais invalidas'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais invalidas'
      });
    }

    // Rastreamento de sequencia de logins
    const agora = new Date();
    const ultimoLogin = user.lastLoginDate;

    if (!ultimoLogin) {
      // Primeiro login
      user.streak = 1;
    } else if (isSameDay(ultimoLogin, agora)) {
      // Ja fez login hoje - sem alteracao
    } else if (isYesterday(ultimoLogin)) {
      // Login consecutivo
      user.streak += 1;
    } else {
      // Sequencia quebrada
      if (user.streak > 1) {
        await notifyStreakBroken(user._id);
      }
      user.streak = 1;
    }

    user.lastLoginDate = agora;
    user.lastCoachReset = agora;
    user.dailyCoachMessages = 0;
    await user.save({ validateBeforeSave: false });

    // Notificacao de boas-vindas (apenas uma vez por dia)
    if (!ultimoLogin || !isSameDay(ultimoLogin, agora)) {
      await notifyDailyLogin(user._id);
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        error: 'Dados do Google incompletos'
      });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      } else {
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          password: googleId + process.env.JWT_SECRET,
          poupMoedas: 50,
          streak: 1,
          lastLoginDate: new Date()
        });
      }
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Sessao terminada'
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const forbiddenFields = ['password', 'plan', 'poupMoedas', 'googleId'];
    for (const field of forbiddenFields) {
      if (req.body[field]) delete req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateMode = async (req, res) => {
  try {
    const { financialMode } = req.body;
    const validModes = ['sobrevivencia', 'recuperacao', 'estabilidade', 'crescimento', 'prosperidade'];

    if (!validModes.includes(financialMode)) {
      return res.status(400).json({
        success: false,
        error: 'Modo financeiro invalido'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { financialMode },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.detectMode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const modoAntigo = user.financialMode;

    const novoModo = await detectarModo(user._id, user.income);

    if (novoModo !== modoAntigo) {
      user.financialMode = novoModo;
      await user.save({ validateBeforeSave: false });

      await notifyModeTransition(user._id, modoAntigo, novoModo);
    }

    res.status(200).json({
      success: true,
      data: {
        previousMode: modoAntigo,
        financialMode: novoModo,
        changed: novoModo !== modoAntigo
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateCoach = async (req, res) => {
  try {
    const { coachName, coachGender, coachPersonality } = req.body;

    const updateData = {};
    if (coachName) updateData.coachName = coachName;
    if (coachGender) updateData.coachGender = coachGender;
    if (coachPersonality) updateData.coachPersonality = coachPersonality;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const {
      income,
      incomeFrequency,
      financialMode,
      coachName,
      coachGender,
      coachPersonality,
      jarPercentages,
      avatar
    } = req.body;

    const updateData = {
      income: income || 0,
      incomeFrequency: incomeFrequency || 'mensal',
      financialMode: financialMode || 'sobrevivencia',
      coachName: coachName || 'Ricardo',
      coachGender: coachGender || 'm',
      coachPersonality: coachPersonality || 'disciplinado',
      onboardingComplete: true,
      poupMoedas: 50
    };

    if (jarPercentages) updateData.jarPercentages = jarPercentages;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Conta eliminada com sucesso'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email e obrigatorio'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Nao revelar que o utilizador nao existe
      return res.status(200).json({
        success: true,
        message: 'Se o email existir, receberas instrucoes para redefinir a palavra-passe'
      });
    }

    // Gerar token de reposicao
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

    await user.save({ validateBeforeSave: false });

    // Em producao, enviaria email com o token
    res.status(200).json({
      success: true,
      message: 'Se o email existir, receberas instrucoes para redefinir a palavra-passe',
      resetToken // Apenas para desenvolvimento
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token e nova palavra-passe sao obrigatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A palavra-passe deve ter pelo menos 6 caracteres'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token invalido ou expirado'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
