const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
      poupMoedas: 50
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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais invalidas'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais invalidas'
      });
    }

    user.lastCoachReset = new Date();
    user.dailyCoachMessages = 0;
    await user.save({ validateBeforeSave: false });

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
          poupMoedas: 50
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
