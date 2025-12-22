import { money } from "../utils/money";

export function gerarInsightsDoMes(base, dadosAno = {}) {
  if (!base?.mesAtual) return [];

  const insights = [];

  const gastoAtual     = base.mesAtual.gastoTotal;
  const gastoAnterior  = base.mesAnterior?.gastoTotal ?? null;
  const sobraAtual     = base.mesAtual.sobra;
  const recorrencias   = base.mesAtual.recorrencias;

  const {
    maiorGastoAno = null,
    maiorSobraAno = null,
    mediaSobraAno = null
  } = dadosAno;

  // =========================
  // 1️⃣ Destaques do ano
  // =========================
  if (maiorGastoAno !== null && gastoAtual === maiorGastoAno) {
    insights.push({
      id: "maior_gasto_ano",
      tipo: "destaque",
      prioridade: 1,
      texto: "Este foi o mês com maior gasto do ano."
    });
  }

  if (
    maiorSobraAno !== null &&
    sobraAtual > 0 &&
    sobraAtual === maiorSobraAno
  ) {
    insights.push({
      id: "maior_sobra_ano",
      tipo: "destaque",
      prioridade: 1,
      texto: "Este foi o melhor mês de economia do ano até agora."
    });
  }

  // =========================
  // 2️⃣ Economia / sobra
  // =========================
  if (sobraAtual > 0) {
    insights.push({
      id: "economizou_mes",
      tipo: "economia",
      prioridade: 2,
      texto: `Você conseguiu economizar ${money(sobraAtual)} este mês.`
    });
  }

  if (
    mediaSobraAno !== null &&
    sobraAtual > mediaSobraAno
  ) {
    insights.push({
      id: "sobra_acima_media",
      tipo: "economia",
      prioridade: 2,
      texto: "A sobra deste mês foi maior que a média do ano."
    });
  }

  // =========================
  // 3️⃣ Gasto total (comparativo)
  // =========================
  if (typeof gastoAnterior === "number") {
    const diff = gastoAtual - gastoAnterior;

    if (diff < 0) {
      insights.push({
        id: "gastou_menos_mes_passado",
        tipo: "gasto",
        prioridade: 3,
        texto: `Você gastou ${money(Math.abs(diff))} a menos que no mês passado.`
      });
    }

    if (diff > 0) {
      insights.push({
        id: "gastou_mais_mes_passado",
        tipo: "gasto",
        prioridade: 3,
        texto: `Seus gastos aumentaram ${money(diff)} em relação ao mês passado.`
      });
    }
  }

  // =========================
  // 4️⃣ Recorrências
  // =========================
  if (gastoAtual > 0 && recorrencias / gastoAtual > 0.2) {
    insights.push({
      id: "recorrencias_altas",
      tipo: "recorrencia",
      prioridade: 4,
      texto: `Assinaturas representaram ${Math.round(
        (recorrencias / gastoAtual) * 100
      )}% dos gastos deste mês.`
    });
  }

  // =========================
  // 5️⃣ Estabilidade
  // =========================
  if (
    typeof gastoAnterior === "number" &&
    gastoAnterior > 0
  ) {
    const variacao = Math.abs(
      (gastoAtual - gastoAnterior) / gastoAnterior
    );

    if (variacao <= 0.05) {
      insights.push({
        id: "gastos_estaveis",
        tipo: "estabilidade",
        prioridade: 5,
        texto: "Seus gastos se mantiveram estáveis em relação ao mês passado."
      });
    }
  }

  // =========================
  // Ordena e limita
  // =========================
  return insights
    .sort((a, b) => a.prioridade - b.prioridade)
    .slice(0, 3);
}
