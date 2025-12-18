export function calcularComparativoPorPessoa({
  mesAtual,
  mesAnterior,
  dados
}) {
  function somarPorPessoa(mes) {
    let amanda = 0;
    let celso = 0;

    // Transactions
    dados.transactions?.forEach(t => {
      if (t.mes !== mes) return;

      const v = Number(t.valor) || 0;

      if (t.quem === "Amanda") amanda += v;
      else if (t.quem === "Celso") celso += v;
      else if (t.quem === "Ambos") {
        amanda += v;
        celso += v;
      }
    });

    // Bills
    dados.bills?.forEach(b => {
      if (b.mes !== mes) return;

      const v = Number(b.valor) || 0;

      if (b.quem === "Amanda") amanda += v;
      else if (b.quem === "Celso") celso += v;
      else if (b.quem === "Ambos") {
        amanda += v;
        celso += v;
      }
    });

    // Reservations (já processadas)
    dados.reservas?.forEach(r => {
      if (r.mes !== mes) return;

      const v = Number(r.valor) || 0;

      if (r.quem === "Amanda") amanda += v;
      else if (r.quem === "Celso") celso += v;
      else if (r.quem === "Ambos") {
        amanda += v;
        celso += v;
      }
    });

    return { amanda, celso };
  }

  function montar(atual, anterior) {
    const valor = atual - anterior;
    return {
      atual,
      anterior,
      valor,
      percentual: anterior === 0 ? 0 : (valor / anterior) * 100
    };
  }

  const atual = somarPorPessoa(mesAtual);
  const anterior = somarPorPessoa(mesAnterior);

  return {
    mesAtual,
    mesAnterior,
    porPessoa: {
      amanda: montar(atual.amanda, anterior.amanda),
      celso: montar(atual.celso, anterior.celso)
    }
  };
}
