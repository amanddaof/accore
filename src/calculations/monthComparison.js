import { safeNumber } from "../core/helpers";
import { mesAnteriorLabel } from "../core/months";

export function compararMesAtualAnterior({
  mes,
  transactions = [],
  reservations = []
}) {
  // se não tiver mes ainda, retorna estrutura vazia (não null)
  if (!mes) {
    return {
      mesAtual: { label: "—", total: 0 },
      mesAnterior: { label: "—", total: 0 },
      variacao: { valor: 0, percentual: 0 }
    };
  }

  const mesAnterior = mesAnteriorLabel(mes) || "—";

  function totalDoMes(label) {
    let total = 0;

    transactions.forEach(t => {
      if (t?.mes === label) {
        total += safeNumber(t.valor);
      }
    });

    reservations.forEach(r => {
      if (r?.mes === label) {
        total += safeNumber(r.valor);
      }
    });

    return total;
  }

  const totalAtual = totalDoMes(mes);
  const totalAnterior = mesAnterior === "—" ? 0 : totalDoMes(mesAnterior);

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
