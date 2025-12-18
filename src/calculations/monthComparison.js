import { isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";

/**
 * Compara mês atual com mês anterior usando a chave `mes`
 * @param {Object} params
 * @param {string} params.mes - formato YYYY-MM
 * @param {Array} params.transactions
 * @param {Array} params.reservations
 */
export function compararMesAtualAnterior({
  mes,
  transactions = [],
  reservations = []
}) {
  if (!mes || typeof mes !== "string") {
    return null;
  }

  function totalDoMes(mesRef) {
    let total = 0;

    transactions.forEach(t => {
      if (t.mes === mesRef) {
        total += Number(t.valor) || 0;
      }
    });

    reservations.forEach(r => {
      if (r.mes === mesRef) {
        total += Number(r.valor) || 0;
      }
    });

    return total;
  }

  const [ano, mesNum] = mes.split("-").map(Number);

  const mesAnterior =
    mesNum === 1
      ? `${ano - 1}-12`
      : `${ano}-${String(mesNum - 1).padStart(2, "0")}`;

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

