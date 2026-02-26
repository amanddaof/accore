import { buscarResumoMes } from "./buscarResumoMes";

const MESES = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

export async function calcularImpactoAnual(ano) {

  const resultado = [];

  for (let i = 0; i < 12; i++) {

    const mesStr = `${MESES[i]}/${String(ano).slice(-2)}`;

    const resumo = await buscarResumoMes(mesStr);

    resultado.push({
      mes: mesStr,

      amanda: {
        salario: resumo.salarioAmanda,
        gasto: resumo.comprometidoAmanda,
        sobra: resumo.sobraAmanda,
        grupos: resumo.gruposAmanda // 👈 ADICIONADO
      },

      celso: {
        salario: resumo.salarioCelso,
        gasto: resumo.comprometidoCelso,
        sobra: resumo.sobraCelso,
        grupos: resumo.gruposCelso // 👈 ADICIONADO
      },

      total: {
        salario: resumo.salarioAmanda + resumo.salarioCelso,
        gasto: resumo.comprometidoAmanda + resumo.comprometidoCelso,
        sobra: resumo.sobraAmanda + resumo.sobraCelso
      }
    });
  }

  return resultado;
}
