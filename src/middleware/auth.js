const jwt = require('jsonwebtoken');
const User = require('../models/User');

const proteger = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.poupt_token) {
    token = req.cookies.poupt_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Nao autorizado - sem token',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utilizador nao encontrado',
      });
    }
    next();
  } catch (erro) {
    return res.status(401).json({
      success: false,
      error: 'Token invalido',
    });
  }
};

module.exports = proteger;
