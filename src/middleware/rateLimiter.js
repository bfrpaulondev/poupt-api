const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiados pedidos. Tenta novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
