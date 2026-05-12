const jwt = require('jsonwebtoken');

exports.gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

exports.enviarTokenCookie = (res, token) => {
  const opcoes = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('poupt_token', token, opcoes);
};

exports.paginacao = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

exports.calcularXP = (acao) => {
  const tabela = {
    registo_transacao: 10,
    registo_despesa: 5,
    pagar_divida: 50,
    criar_objetivo: 20,
    chat_coach: 5,
    login_diario: 15,
  };

  return tabela[acao] || 0;
};

exports.nivelDeXP = (xp) => {
  return Math.floor(xp / 100) + 1;
};

exports.formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(valor);
};

exports.inicioDoDia = (data) => {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.fimDoDia = (data) => {
  const d = new Date(data);
  d.setHours(23, 59, 59, 999);
  return d;
};

exports.inicioDoMes = (ano, mes) => {
  return new Date(ano, mes, 1);
};

exports.fimDoMes = (ano, mes) => {
  return new Date(ano, mes + 1, 0, 23, 59, 59, 999);
};
