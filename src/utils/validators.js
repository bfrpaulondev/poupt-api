const validator = require('validator');

exports.validarRegisto = (dados) => {
  const erros = [];

  if (!dados.name || dados.name.trim().length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!dados.email || !validator.isEmail(dados.email)) {
    erros.push('Email invalido');
  }

  if (!dados.password || dados.password.length < 6) {
    erros.push('Palavra-passe deve ter pelo menos 6 caracteres');
  }

  return erros;
};

exports.validarLogin = (dados) => {
  const erros = [];

  if (!dados.email || !validator.isEmail(dados.email)) {
    erros.push('Email invalido');
  }

  if (!dados.password) {
    erros.push('Palavra-passe e obrigatoria');
  }

  return erros;
};

exports.validarTransacao = (dados) => {
  const erros = [];

  if (!dados.type || !['receita', 'despesa'].includes(dados.type)) {
    erros.push('Tipo deve ser "receita" ou "despesa"');
  }

  if (!dados.amount || dados.amount <= 0) {
    erros.push('Montante deve ser maior que zero');
  }

  if (!dados.category || dados.category.trim() === '') {
    erros.push('Categoria e obrigatoria');
  }

  if (dados.jar && !['necessidades', 'liberdade', 'poupanca', 'educacao', 'lazer', 'doar'].includes(dados.jar)) {
    erros.push('Frasco invalido');
  }

  return erros;
};

exports.validarDivida = (dados) => {
  const erros = [];

  if (!dados.creditorName || dados.creditorName.trim() === '') {
    erros.push('Nome do credor e obrigatorio');
  }

  if (!dados.amount || dados.amount <= 0) {
    erros.push('Montante deve ser maior que zero');
  }

  if (dados.type && !['cartao_credito', 'emprestimo_pessoal', 'emprestimo_habitacao', 'automovel', 'outro'].includes(dados.type)) {
    erros.push('Tipo de divida invalido');
  }

  return erros;
};

exports.validarDividaInformal = (dados) => {
  const erros = [];

  if (!dados.creditorName || dados.creditorName.trim() === '') {
    erros.push('Nome do credor e obrigatorio');
  }

  if (!dados.amount || dados.amount <= 0) {
    erros.push('Montante deve ser maior que zero');
  }

  if (!dados.loanDate) {
    erros.push('Data do emprestimo e obrigatoria');
  }

  return erros;
};

exports.validarObjetivo = (dados) => {
  const erros = [];

  if (!dados.name || dados.name.trim() === '') {
    erros.push('Nome do objetivo e obrigatorio');
  }

  if (!dados.targetAmount || dados.targetAmount <= 0) {
    erros.push('Montante alvo deve ser maior que zero');
  }

  if (dados.type && !['fundo_emergencia', 'poupanca', 'investimento', 'viagem', 'outro'].includes(dados.type)) {
    erros.push('Tipo de objetivo invalido');
  }

  return erros;
};

exports.validarInvestimento = (dados) => {
  const erros = [];

  if (!dados.name || dados.name.trim() === '') {
    erros.push('Nome do investimento e obrigatorio');
  }

  if (!dados.type || !['stock', 'etf', 'fund', 'crypto', 'real_estate', 'ppr', 'other'].includes(dados.type)) {
    erros.push('Tipo de investimento invalido');
  }

  return erros;
};

exports.validarFrascos = (percentagens) => {
  const chaves = ['necessidades', 'liberdade', 'poupanca', 'educacao', 'lazer', 'doar'];
  const total = chaves.reduce((soma, chave) => soma + (percentagens[chave] || 0), 0);

  if (total !== 100) {
    return `A soma das percentagens deve ser 100% (atual: ${total}%)`;
  }

  return null;
};
