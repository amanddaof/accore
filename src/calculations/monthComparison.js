import { safeNumber } from "../core/helpers";
import { mesAnteriorLabel } from "../core/months";

/**
 * Comparativo mensal usando mes = "Jan/26"
 */
export function compararMesAtualAnterior({
  mes,
  transactions = [],
  reservations = []
}) {
  if (!mes) return null;

  const mesAnterior = mesAnteriorLabel(mes);
  if (!mesAnterior) return null;

  function totalDoMes(label) {
    let total = 0;

    transactions.forEach(t => {
      if (t.mes === label) {
        total += safeNumber(t.valor);
      }
    });

    reservations.forEach(r => {
      if (r.mes === label) {
        total += safeNumber(r.valor);
      }
    });

    return total;
  }

  const totalAtual = totalDoMes(mes);
  const totalAnterior = totalDoMes(mesAnterior);

  const diferenca = totalAtual - totalAnterior;
  const percentual =
    totalAnterior === 0 ? 0 : (diferenca / totalAnterior) * 100;

  return {
    mesAtual: {
      label: mes,
      total: totalAtual
    },
    mesAnterior: {
      label: mesAnterior,
      total: totalAnterior
    },
    variacao: {
      valor: diferenca,
      percentual
    }
  };
}
