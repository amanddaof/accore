/**
 * Gera avisos do mês com base:
 * - nos dados mensais já calculados
 * - nas preferências do usuário
 */
export function buildMonthlyAlerts({
  perfil,
  saldoMes,            // SOBRA REAL DO MÊS (já filtrada)
  projecaoSaldoMes,    // SOBRA PROJETADA
  gastoAtual,
  gastoMedio
}) {
  if (!perfil) return [];

  const avisos = [];

  const temDeficit = saldoMes < 0;

  /* ===================== 🔴 DÉFICIT ===================== */
  if (perfil.notify_deficit && temDeficit) {
    avisos.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });
  }

  /* ===================== 📉 PROJEÇÃO NEGATIVA ===================== */
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

  /* ===================== ⚠️ SOBRA BAIXA ===================== */
  // ❗️ Só avalia se NÃO houver déficit
  if (
    perfil.notify_low_sobra &&
    !temDeficit &&
    typeof perfil.min_sobra_alert === "number" &&
    saldoMes < perfil.min_sobra_alert
  ) {
    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Sobra do mês abaixo do mínimo configurado"
    });
  }

  /* ===================== 🔥 GASTOS ANORMAIS ===================== */
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
