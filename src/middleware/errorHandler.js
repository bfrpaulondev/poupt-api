const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, error: 'Recurso nao encontrado' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: 'Registo duplicado' });
  }

  if (err.name === 'ValidationError') {
    const mensagens = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: mensagens.join(', ') });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Token invalido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expirado' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
