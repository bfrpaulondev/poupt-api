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

// Stricter rate limiter for auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Demasiadas tentativas. Tenta novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter, authLimiter };
