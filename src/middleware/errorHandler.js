const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error.message = 'Recurso nao encontrado';
    return res.status(404).json({ success: false, error: error.message });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    error.message = `Ja existe um registo com esse ${campo}`;
    return res.status(400).json({ success: false, error: error.message });
  }

  if (err.name === 'ValidationError') {
    const mensagens = Object.values(err.errors).map((e) => e.message);
    error.message = mensagens.join(', ');
    return res.status(400).json({ success: false, error: error.message });
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token invalido';
    return res.status(401).json({ success: false, error: error.message });
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    return res.status(401).json({ success: false, error: error.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
