import { isoMesParaLabel, mesIsoAnterior } from "../core/months";

export function compararMesAtualAnterior({
  mes,
  totalAtual,
  totalAnterior
}) {
  const diferenca = totalAtual - totalAnterior;
  const percentual =
    totalAnterior === 0 ? 0 : (diferenca / totalAnterior) * 100;

  return {
    mesAtual: {
      label: isoMesParaLabel(mes),
      total: totalAtual
    },
    mesAnterior: {
      label: isoMesParaLabel(mesIsoAnterior(mes)),
      total: totalAnterior
    },
    variacao: {
      valor: diferenca,
      percentual
    }
  };
}
