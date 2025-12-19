import { calcularTotalMensal, calcularGastosPorPessoa } from "./monthly";

/**
 * Compara o mês atual com a média dos últimos N meses
 */
export function compararMediaMeses({
  mesAtual,
  meses,
  dados
}) {
  if (!mesAtual || !meses || meses <= 0) return null;

  const mesesAnteriores = [];
  let [ano, mes] = mesAtual.split("-").map(Number);

  for (let i = 1; i <= meses; i++) {
    mes -= 1;
    if (mes === 0) {
      mes = 12;
      ano -= 1;
    }
    mesesAnteriores.push(
      `${ano}-${String(mes).padStart(2, "0")}`
    );
  }

  /* ===== TOTAL ===== */
  let somaTotal = 0;
  let mesesValidos = 0;

  mesesAnteriores.forEach(m => {
    const total = calcularTotalMensal(m, dados);
    if (total > 0) {
      somaTotal += total;
      mesesValidos++;
    }
  });

  const mediaTotal =
    mesesValidos > 0 ? somaTotal / mesesValidos : 0;

  const totalAtual = calcularTotalMensal(mesAtual, dados);

  /* ===== POR PESSOA ===== */
  let somaAmanda = 0;
  let somaCelso = 0;

  mesesAnteriores.forEach(m => {
    const [a, c] = calcularGastosPorPessoa(m, dados);
    somaAmanda += a?.total || 0;
    somaCelso += c?.total || 0;
  });

  const mediaAmanda =
    mesesAnteriores.length ? somaAmanda / mesesAnteriores.length : 0;

  const mediaCelso =
    mesesAnteriores.length ? somaCelso / mesesAnteriores.length : 0;

  const [amandaAtual, celsoAtual] =
    calcularGastosPorPessoa(mesAtual, dados);

  const montar = (atual, media) => {
    const diff = atual - media;
    return {
      atual,
      media,
      valor: diff,
      percentual: media === 0 ? 0 : (diff / media) * 100
    };
  };

  return {
    total: montar(totalAtual, mediaTotal),
    porPessoa: {
      amanda: montar(amandaAtual?.total || 0, mediaAmanda),
      celso: montar(celsoAtual?.total || 0, mediaCelso)
    }
  };
}
