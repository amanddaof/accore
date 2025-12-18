import { calcularReservasProjetadasParaMes } from "./monthly";
import { isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";

/**
 * Compara mês atual com mês anterior
 * @param {Object} params
 * @param {Date | string} params.mesAtual - ISO ou Date
 * @param {Array} params.transactions
 * @param {Array} params.reservations
 */
export function compararMesAtualAnterior({
  mesAtual,
  transactions = [],
  reservations = []
}) {
  const base = new Date(mesAtual);

  const mesAtualDate = new Date(base.getFullYear(), base.getMonth(), 1);
  const mesAnteriorDate = new Date(base.getFullYear(), base.getMonth() - 1, 1);

  function totalDoMes(date) {
    const ano = date.getFullYear();
    const mes = date.getMonth();

    let total = 0;

    // transactions
    transactions.forEach(t => {
      if (!t.data_real) return;

      const d = new Date(t.data_real);
      if (d.getFullYear() === ano && d.getMonth() === mes) {
        total += safeNumber(t.valor);
      }
    });

    // reservas projetadas
    const reservasMes = calcularReservasProjetadasParaMes({
      ano,
      mes,
      reservations
    });

    total += safeNumber(reservasMes?.total);

    return total;
  }

  const totalAtual = totalDoMes(mesAtualDate);
  const totalAnterior = totalDoMes(mesAnteriorDate);

  const diferenca = totalAtual - totalAnterior;
  const percentual =
    totalAnterior === 0 ? 0 : (diferenca / totalAnterior) * 100;

  return {
    mesAtual: {
      label: isoParaMesAbrev(mesAtualDate),
      total: totalAtual
    },
    mesAnterior: {
      label: isoParaMesAbrev(mesAnteriorDate),
      total: totalAnterior
    },
    variacao: {
      valor: diferenca,
      percentual
    }
  };
}
