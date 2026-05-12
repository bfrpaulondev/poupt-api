const Transaction = require('../models/Transaction');
const Debt = require('../models/Debt');
const InformalDebt = require('../models/InformalDebt');
const Investment = require('../models/Investment');
const Goal = require('../models/Goal');
const { calcularBolaDeNeve } = require('../services/snowball');
const { inicioDoMes, fimDoMes } = require('../utils/helpers');

exports.resumo = async (req, res, next) => {
  try {
    const transacoes = await Transaction.find({ userId: req.user._id });

    const totalReceitas = transacoes
      .filter((t) => t.type === 'receita')
      .reduce((soma, t) => soma + t.amount, 0);
    const totalDespesas = transacoes
      .filter((t) => t.type === 'despesa')
      .reduce((soma, t) => soma + t.amount, 0);

    const dividasFormais = await Debt.find({ userId: req.user._id, status: { $ne: 'pago' } });
    const dividasInformais = await InformalDebt.find({ userId: req.user._id, status: { $ne: 'pago' } });

    const totalDividas = dividasFormais.reduce((soma, d) => soma + (d.amount - d.amountPaid), 0)
      + dividasInformais.reduce((soma, d) => soma + (d.amount - d.amountPaid), 0);

    const investimentos = await Investment.find({ userId: req.user._id });
    const totalInvestido = investimentos.reduce(
      (soma, i) => soma + (i.quantity * i.currentPrice),
      0
    );

    const objetivos = await Goal.find({ userId: req.user._id });

    const despesasPorCategoria = {};
    transacoes
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        despesasPorCategoria[t.category] = (despesasPorCategoria[t.category] || 0) + t.amount;
      });

    res.json({
      success: true,
      data: {
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo: totalReceitas - totalDespesas,
        dividas: totalDividas,
        investimentos: totalInvestido,
        numDividasFormais: dividasFormais.length,
        numDividasInformais: dividasInformais.length,
        numInvestimentos: investimentos.length,
        numObjetivos: objetivos.length,
        despesasPorCategoria,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.mensal = async (req, res, next) => {
  try {
    const ano = parseInt(req.query.ano, 10) || new Date().getFullYear();
    const mes = parseInt(req.query.mes, 10) || new Date().getMonth();

    const inicio = inicioDoMes(ano, mes);
    const fim = fimDoMes(ano, mes);

    const transacoes = await Transaction.find({
      userId: req.user._id,
      date: { $gte: inicio, $lte: fim },
    });

    const receitas = transacoes.filter((t) => t.type === 'receita');
    const despesas = transacoes.filter((t) => t.type === 'despesa');

    const totalReceitas = receitas.reduce((soma, t) => soma + t.amount, 0);
    const totalDespesas = despesas.reduce((soma, t) => soma + t.amount, 0);

    const despesasPorCategoria = {};
    despesas.forEach((t) => {
      despesasPorCategoria[t.category] = (despesasPorCategoria[t.category] || 0) + t.amount;
    });

    const despesasPorFrasco = {};
    despesas.forEach((t) => {
      if (t.jar) {
        despesasPorFrasco[t.jar] = (despesasPorFrasco[t.jar] || 0) + t.amount;
      }
    });

    const receitasPorCategoria = {};
    receitas.forEach((t) => {
      receitasPorCategoria[t.category] = (receitasPorCategoria[t.category] || 0) + t.amount;
    });

    res.json({
      success: true,
      data: {
        ano,
        mes: mes + 1,
        totalReceitas,
        totalDespesas,
        saldoMensal: totalReceitas - totalDespesas,
        despesasPorCategoria,
        despesasPorFrasco,
        receitasPorCategoria,
        numTransacoes: transacoes.length,
      },
    });
  } catch (erro) {
    next(erro);
  }
};

exports.progressoDividas = async (req, res, next) => {
  try {
    const dividas = await Debt.find({ userId: req.user._id });
    const pagamentoExtra = parseFloat(req.query.pagamentoExtra) || 0;

    const resultado = calcularBolaDeNeve(dividas, pagamentoExtra);

    const dividasInformais = await InformalDebt.find({ userId: req.user._id });
    const totalPagoFormal = dividas.reduce((soma, d) => soma + d.amountPaid, 0);
    const totalFormal = dividas.reduce((soma, d) => soma + d.amount, 0);
    const totalPagoInformal = dividasInformais.reduce((soma, d) => soma + d.amountPaid, 0);
    const totalInformal = dividasInformais.reduce((soma, d) => soma + d.amount, 0);

    res.json({
      success: true,
      data: {
        bolaDeNeve: resultado,
        resumo: {
          totalDividas: totalFormal + totalInformal,
          totalPago: totalPagoFormal + totalPagoInformal,
          percentagemPaga: totalFormal + totalInformal > 0
            ? Math.round(((totalPagoFormal + totalPagoInformal) / (totalFormal + totalInformal)) * 100)
            : 0,
          formais: { total: totalFormal, pago: totalPagoFormal },
          informais: { total: totalInformal, pago: totalPagoInformal },
        },
      },
    });
  } catch (erro) {
    next(erro);
  }
};
