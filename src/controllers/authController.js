const User = require('../models/User');
const { validarRegisto, validarLogin } = require('../utils/validators');
const { gerarToken, enviarTokenCookie } = require('../utils/helpers');

exports.registar = async (req, res, next) => {
  try {
    const erros = validarRegisto(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const { name, email, password } = req.body;

    const utilizadorExistente = await User.findOne({ email });
    if (utilizadorExistente) {
      return res.status(400).json({ success: false, error: 'Ja existe uma conta com este email' });
    }

    const utilizador = await User.create({ name, email, password });

    const token = gerarToken(utilizador._id);
    enviarTokenCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        id: utilizador._id,
        name: utilizador.name,
        email: utilizador.email,
        poupMoedas: utilizador.poupMoedas,
        plan: utilizador.plan,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.login = async (req, res, next) => {
  try {
    const erros = validarLogin(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ success: false, error: erros.join(', ') });
    }

    const { email, password } = req.body;

    const utilizador = await User.findOne({ email }).select('+password');
    if (!utilizador) {
      return res.status(401).json({ success: false, error: 'Credenciais invalidas' });
    }

    const passwordCorreta = await utilizador.matchPassword(password);
    if (!passwordCorreta) {
      return res.status(401).json({ success: false, error: 'Credenciais invalidas' });
    }

    utilizador.lastLogin = new Date();
    await utilizador.save({ validateBeforeSave: false });

    const token = gerarToken(utilizador._id);
    enviarTokenCookie(res, token);

    res.json({
      success: true,
      data: {
        id: utilizador._id,
        name: utilizador.name,
        email: utilizador.email,
        poupMoedas: utilizador.poupMoedas,
        plan: utilizador.plan,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ success: false, error: 'Token do Google obrigatorio' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client();

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
      });
      payload = ticket.getPayload();
    } catch (erro) {
      return res.status(401).json({ success: false, error: 'Token do Google invalido' });
    }

    const { sub: googleId, email, name, picture } = payload;

    let utilizador = await User.findOne({ googleId });

    if (!utilizador) {
      utilizador = await User.findOne({ email });
      if (utilizador) {
        utilizador.googleId = googleId;
        utilizador.avatar = picture || utilizador.avatar;
        await utilizador.save({ validateBeforeSave: false });
      } else {
        utilizador = await User.create({
          name,
          email,
          googleId,
          avatar: picture || '',
          password: googleId + process.env.JWT_SECRET,
        });
      }
    }

    utilizador.lastLogin = new Date();
    await utilizador.save({ validateBeforeSave: false });

    const jwtToken = gerarToken(utilizador._id);
    enviarTokenCookie(res, jwtToken);

    res.json({
      success: true,
      data: {
        id: utilizador._id,
        name: utilizador.name,
        email: utilizador.email,
        poupMoedas: utilizador.poupMoedas,
        plan: utilizador.plan,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.logout = (req, res) => {
  res.cookie('poupt_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({ success: true, data: {} });
};

exports.obterPerfil = async (req, res, next) => {
  try {
    const utilizador = await User.findById(req.user._id);

    res.json({
      success: true,
      data: utilizador,
    });
  } catch (erro) {
    next(erro);
  }
};
