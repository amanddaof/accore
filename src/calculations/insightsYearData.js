import {
  calcularTotalMensal,
  calcularGastosPorPessoa
} from "./monthly";

/**
 * Dados anuais para Insights do mês
 * Fonte única: calculations/*
 */
export function montarDadosAnoInsights(ano, dados, salarios) {
  let maiorGastoAno = 0;
  let maiorSobraAno = 0;
  let somaSobras = 0;
  let mesesValidos = 0;

  for (let m = 1; m <= 12; m++) {
    const mesISO = `${ano}-${String(m).padStart(2, "0")}`;

    const gastoMes = calcularTotalMensal(mesISO, dados);
    if (gastoMes === 0) continue;

    if (gastoMes > maiorGastoAno) {
      maiorGastoAno = gastoMes;
    }

    const [a, c] = calcularGastosPorPessoa(mesISO, dados);

    const sobraMes =
      (salarios.amanda.salario - (a?.total || 0)) +
      (salarios.celso.salario  - (c?.total || 0));

    if (sobraMes > maiorSobraAno) {
      maiorSobraAno = sobraMes;
    }

    somaSobras += sobraMes;
    mesesValidos++;
  }

  return {
    maiorGastoAno,
    maiorSobraAno,
    mediaSobraAno: mesesValidos ? somaSobras / mesesValidos : 0
  };
}
