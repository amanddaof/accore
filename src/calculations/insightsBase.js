import {
  calcularTotalMensal,
  calcularGastosPorPessoa,
  calcularReservasProjetadasParaMes
} from "./monthly";

/**
 * Monta a base numérica para os insights do mês
 * Fonte única de verdade: calculations/*
 */
export function montarBaseInsightsMes({
  mesISO,
  dados,
  salarios
}) {
  if (!mesISO || !dados || !salarios) return null;

  // ========================
  // 📆 Mês anterior
  // ========================
  const [ano, mes] = mesISO.split("-").map(Number);
  const mesAnteriorISO =
    mes === 1
      ? `${ano - 1}-12`
      : `${ano}-${String(mes - 1).padStart(2, "0")}`;

  // ========================
  // 💰 Gasto total
  // ========================
  const gastoAtual = calcularTotalMensal(mesISO, dados);
  const gastoAnterior = calcularTotalMensal(mesAnteriorISO, dados);

  // ========================
  // 👥 Gasto por pessoa
  // ========================
  const [amanda, celso] = calcularGastosPorPessoa(mesISO, dados);

  const gastoAmanda = amanda?.total || 0;
  const gastoCelso  = celso?.total  || 0;

  // ========================
  // 🏦 Sobra do mês
  // ========================
  const salAmanda = salarios?.amanda?.salario || 0;
  const salCelso  = salarios?.celso?.salario  || 0;

  const sobraMes =
    (salAmanda - gastoAmanda) +
    (salCelso  - gastoCelso);

  // ========================
  // 🔁 Recorrências (reservas)
  // ========================
  const reservasMes = calcularReservasProjetadasParaMes(
    mesISO,
    dados.reservas,
    dados.cards,
    dados.transactions
  );

  const totalRecorrencias = reservasMes.reduce(
    (acc, r) => acc + Number(r.valor || 0),
    0
  );

  // ========================
  // 📤 Retorno padronizado
  // ========================
  return {
    mesAtual: {
      gastoTotal: gastoAtual,
      sobra: sobraMes,
      recorrencias: totalRecorrencias
    },

    mesAnterior: {
      gastoTotal: gastoAnterior
    }
  };
}
