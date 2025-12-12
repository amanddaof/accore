import { calcularProjecaoPorPessoaAnual } from "./monthly";

/**
 * Calcula a projeção anual REAL + FUTURA baseada em:
 * - meses com savings reais já registrados
 * - projeção mensal correta (usando transactions, bills, reservas, loans)
 */
export function calcularProjecaoEconomiaAnual({
  ano,
  dadosReais,
  salarios,
  dadosMensais
}) {
  const somaReais = dadosReais.reduce(
    (acc, r) => acc + Number(r.economizado_real || 0),
    0
  );

  const mesesReaisSet = new Set(dadosReais.map(r => Number(r.mes)));

  const now = new Date();
  const anoAtual = now.getFullYear();
  const mesAtual = now.getMonth() + 1; // 1–12

  const mesesFuturos = [];
  for (let m = 1; m <= 12; m++) {
    const jaPassou = ano === anoAtual && m < mesAtual;
    if (!mesesReaisSet.has(m) && !jaPassou) {
      mesesFuturos.push(m);
    }
  }

  let sobraProjetadaTotal = 0;

  mesesFuturos.forEach(mes => {
    const mesISO = `${ano}-${String(mes).padStart(2, "0")}`;

    const proj = calcularProjecaoPorPessoaAnual(mesISO, dadosMensais);

    const gastoAmanda = proj?.amanda?.projecao || 0;
    const gastoCelso  = proj?.celso?.projecao  || 0;

    const salAmanda = salarios?.amanda?.salario || 0;
    const salCelso  = salarios?.celso?.salario  || 0;

    const sobraMes = (salAmanda - gastoAmanda) + (salCelso - gastoCelso);

    sobraProjetadaTotal += sobraMes;
  });

  return {
    somaReais,
    sobraProjetadaTotal,
    totalProjetadoAno: somaReais + sobraProjetadaTotal,
    mesesFuturos,             // array com os meses futuros
    mesesReais: mesesReaisSet.size
  };
}

