import { safeNumber } from "../core/helpers";
import { isoMesParaLabel, mesIsoAnterior } from "../core/months";

export function compararMesAtualAnterior({
  mes, // YYYY-MM
  transactions = [],
  reservations = []
}) {
  if (!mes) {
    return {
      mesAtual: { label: "—", total: 0 },
      mesAnterior: { label: "—", total: 0 },
      variacao: { valor: 0, percentual: 0 }
    };
  }

  const mesAnterior = mesIsoAnterior(mes);

  function totalDoMes(mesRef) {
    let total = 0;

    transactions.forEach(t => {
      if (t.mes === mesRef) {
        total += safeNumber(t.valor);
      }
    });

    reservations.forEach(r => {
      if (r.mes === mesRef) {
        total += safeNumber(r.valor);
      }
    });

    return total;
  }

  const totalAtual = totalDoMes(mes);
  const totalAnterior = mesAnterior ? totalDoMes(mesAnterior) : 0;

  const diferenca = totalAtual - totalAnterior;
  const percentual =
    totalAnterior === 0 ? 0 : (diferenca / totalAnterior) * 100;

  return {
    mesAtual: {
      label: isoMesParaLabel(mes),
      total: totalAtual
    },
    mesAnterior: {
      label: isoMesParaLabel(mesAnterior),
      total: totalAnterior
    },
    variacao: {
      valor: diferenca,
      percentual
    }
  };
}
