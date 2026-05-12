const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.token && req.cookies.token !== 'none') {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Nao autenticado. Faz login para continuar.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utilizador nao encontrado'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Sessao invalida. Faz login novamente.'
    });
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.token && req.cookies.token !== 'none') {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (err) {
    // Continue without auth
  }
  next();
};

exports.premiumOnly = (req, res, next) => {
  if (req.user && req.user.plan !== 'premium') {
    return res.status(403).json({
      success: false,
      error: 'Funcionalidade exclusiva Premium. Atualiza a tua conta.'
    });
  }
  next();
};
