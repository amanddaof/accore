/**
 * Gera avisos do mês com base:
 * - nos dados do mês filtrado
 * - nas preferências do usuário
 */
export function buildMonthlyAlerts({
  perfil,
  saldoMes,            // número (pode ser negativo)
  projecaoSaldoMes,    // número | null
  gastoAtual,
  gastoMedio
}) {
  if (!perfil) return [];

  const avisos = [];

  /* =========================
     1️⃣ DÉFICIT (PRIORIDADE MÁXIMA)
  ========================= */
  if (perfil.notify_deficit && saldoMes < 0) {
    avisos.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });

    // ⛔ IMPORTANTE:
    // Se está em déficit, NÃO faz sentido avisar sobra baixa
    return avisos;
  }

  /* =========================
     2️⃣ PROJEÇÃO NEGATIVA
  ========================= */
  if (
    perfil.notify_projection_negative &&
    typeof projecaoSaldoMes === "number" &&
    projecaoSaldoMes < 0
  ) {
    avisos.push({
      tipo: "erro",
      icon: "📉",
      texto: "Projeção indica déficit até o fim do mês"
    });
  }

  /* =========================
     3️⃣ SOBRA BAIXA (APENAS SE NÃO HÁ DÉFICIT)
  ========================= */
  if (
    perfil.notify_low_sobra &&
    saldoMes >= 0 &&
    typeof perfil.min_sobra_alert === "number" &&
    saldoMes < perfil.min_sobra_alert
  ) {
    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Sobra do mês abaixo do mínimo configurado"
    });
  }

  /* =========================
     4️⃣ GASTOS ACIMA DO PADRÃO
  ========================= */
  if (
    perfil.notify_abnormal_spending &&
    gastoMedio > 0 &&
    gastoAtual > gastoMedio * (perfil.gasto_alert_percent / 100)
  ) {
    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Gastos acima do padrão recente"
    });
  }

  return avisos;
}
