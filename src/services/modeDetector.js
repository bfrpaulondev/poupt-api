const Debt = require('../models/Debt');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Goal = require('../models/Goal');

const detectarModo = async (userId, rendimento) => {
  const agora = new Date();
  const dividas = await Debt.find({ userId, status: { $ne: 'pago' } });
  const transacoes = await Transaction.find({ userId }).sort({ date: -1 });

  const despesas = transacoes
    .filter((t) => t.type === 'despesa')
    .reduce((soma, t) => soma + t.amount, 0);
  const receitas = transacoes
    .filter((t) => t.type === 'receita')
    .reduce((soma, t) => soma + t.amount, 0);

  const saldo = receitas - despesas;

  const dividasAtrasadas = dividas.filter(
    (d) => d.status === 'em_atraso' || (d.dueDate && new Date(d.dueDate) < agora && d.status === 'ativo')
  );

  if (dividasAtrasadas.length > 0 || saldo < 0) {
    return 'sobrevivencia';
  }

  const totalDividas = dividas.reduce((soma, d) => soma + (d.amount - d.amountPaid), 0);
  const rendimentoMensal = rendimento || receitas;
  const ratioDividaRendimento = rendimentoMensal > 0 ? (totalDividas / rendimentoMensal) * 100 : 0;

  if (dividas.length > 0 && ratioDividaRendimento > 30) {
    return 'recuperacao';
  }

  const objetivoFundo = await Goal.findOne({
    userId,
    type: 'fundo_emergencia',
  });
  const fundoEmergencia = objetivoFundo ? objetivoFundo.currentAmount : 0;
  const mesesFundo = rendimentoMensal > 0 ? fundoEmergencia / (despesas / Math.max(transacoes.filter(t => t.type === 'despesa').length, 1)) : 0;

  if (ratioDividaRendimento < 30 && mesesFundo < 6) {
    return 'estabilidade';
  }

  const investimentos = await Investment.find({ userId });
  if (mesesFundo >= 6 && investimentos.length > 0) {
    const rendimentoPassivo = investimentos.reduce(
      (soma, i) => soma + (i.dividends || 0),
      0
    );
    const despesaMensal = rendimentoMensal > 0 ? despesas / Math.max(transacoes.filter(t => t.type === 'despesa').length, 1) : 1;

    if (rendimentoPassivo >= despesaMensal * 0.75) {
      return 'prosperidade';
    }

    return 'crescimento';
  }

  if (mesesFundo >= 6) {
    return 'crescimento';
  }

  return 'estabilidade';
};

module.exports = { detectarModo };
