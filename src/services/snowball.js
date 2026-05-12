const calcularBolaDeNeve = (dividas, pagamentoExtra = 0) => {
  const dividasOrdenadas = [...dividas]
    .filter((d) => d.status !== 'pago' && d.amount > d.amountPaid)
    .sort((a, b) => a.amount - a.amount);

  if (dividasOrdenadas.length === 0) {
    return {
      ordem: [],
      totalJuros: 0,
      mesesParaLiberdade: 0,
      timeline: [],
    };
  }

  const timeline = [];
  let totalJuros = 0;
  let mesAtual = 0;

  const dividasAtivas = dividasOrdenadas.map((d) => ({
    id: d._id ? d._id.toString() : d.creditorName,
    creditorName: d.creditorName,
    saldoRestante: d.amount - d.amountPaid,
    taxaJuro: d.interestRate || 0,
    pagamentoMinimo: d.minimumPayment || 0,
    tipo: d.type || 'outro',
  }));

  const somaPagamentosMinimos = dividasAtivas.reduce(
    (soma, d) => soma + d.pagamentoMinimo,
    0
  );

  const pagamentoDisponivel = somaPagamentosMinimos + pagamentoExtra;

  while (dividasAtivas.some((d) => d.saldoRestante > 0)) {
    mesAtual++;
    if (mesAtual > 600) break;

    let orçamento = pagamentoDisponivel;

    for (const divida of dividasAtivas) {
      if (divida.saldoRestante <= 0) continue;

      const juroMensal = (divida.saldoRestante * divida.taxaJuro) / 100 / 12;
      totalJuros += juroMensal;
      divida.saldoRestante += juroMensal;
    }

    for (const divida of dividasAtivas) {
      if (divida.saldoRestante <= 0) continue;

      const pagamento = Math.min(divida.pagamentoMinimo, divida.saldoRestante);
      divida.saldoRestante -= pagamento;
      orçamento -= pagamento;
    }

    const dividaAlvo = dividasAtivas.find((d) => d.saldoRestante > 0);
    if (dividaAlvo && orçamento > 0) {
      const pagamentoExtraReal = Math.min(orçamento, dividaAlvo.saldoRestante);
      dividaAlvo.saldoRestante -= pagamentoExtraReal;
    }

    const dividaQuitada = dividasAtivas.find(
      (d) => d.saldoRestante <= 0 && d.saldoRestante > -1
    );

    if (dividaQuitada) {
      dividaQuitada.saldoRestante = 0;
      const dataEstimada = new Date();
      dataEstimada.setMonth(dataEstimada.getMonth() + mesAtual);

      timeline.push({
        mes: mesAtual,
        dataEstimada,
        dividaQuitada: dividaQuitada.creditorName,
        saldoTotalRestante: dividasAtivas.reduce(
          (soma, d) => soma + Math.max(0, d.saldoRestante),
          0
        ),
      });
    }

    dividasAtivas.forEach((d) => {
      if (d.saldoRestante < 0) d.saldoRestante = 0;
    });

    if (dividasAtivas.every((d) => d.saldoRestante <= 0)) break;
  }

  return {
    ordem: dividasOrdenadas.map((d) => ({
      id: d._id,
      creditorName: d.creditorName,
      amount: d.amount,
      amountPaid: d.amountPaid,
      saldoRestante: d.amount - d.amountPaid,
    })),
    totalJuros: Math.round(totalJuros * 100) / 100,
    mesesParaLiberdade: mesAtual,
    timeline,
  };
};

module.exports = { calcularBolaDeNeve };
