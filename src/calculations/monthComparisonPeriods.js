import { calcularTotalMensal, calcularGastosPorPessoa } from "./monthly";

/* ======================================================
   Utilitário: lista de meses anteriores (YYYY-MM)
====================================================== */
function gerarMesesAnteriores(mesAtual, quantidade) {
  let [ano, mes] = mesAtual.split("-").map(Number);
  const meses = [];

  for (let i = 0; i < quantidade; i++) {
    mes -= 1;
    if (mes === 0) {
      mes = 12;
      ano -= 1;
    }
    meses.push(`${ano}-${String(mes).padStart(2, "0")}`);
  }

  return meses;
}

/* ======================================================
   Comparação por períodos equivalentes
====================================================== */
export function compararPeriodos({
  mesAtual,
  meses,
  dados
}) {
  if (!mesAtual || !meses) return null;

  const periodoAtual = gerarMesesAnteriores(mesAtual, meses);
  const periodoAnterior = gerarMesesAnteriores(
    periodoAtual[periodoAtual.length - 1],
    meses
  );

  /* ===== TOTAL ===== */
  const somaPeriodo = lista =>
    lista.reduce((acc, mes) => acc + calcularTotalMensal(mes, dados), 0);

  const totalAtual = somaPeriodo(periodoAtual);
  const totalAnterior = somaPeriodo(periodoAnterior);

  const montar = (atual, anterior) => {
    const diff = atual - anterior;
    return {
      atual,
      anterior,
      valor: diff,
      percentual: anterior === 0 ? 0 : (diff / anterior) * 100
    };
  };

  /* ===== POR PESSOA ===== */
  const somaPessoa = (lista, index) =>
    lista.reduce((acc, mes) => {
      const pessoas = calcularGastosPorPessoa(mes, dados);
      return acc + (pessoas?.[index]?.total || 0);
    }, 0);

  return {
    total: montar(totalAtual, totalAnterior),
    porPessoa: {
      amanda: montar(
        somaPessoa(periodoAtual, 0),
        somaPessoa(periodoAnterior, 0)
      ),
      celso: montar(
        somaPessoa(periodoAtual, 1),
        somaPessoa(periodoAnterior, 1)
      )
    }
  };
}
