export function buildMonthlyAlerts({
  perfil,
  saldoMes,
  projecaoSaldoMes,
  gastoAtual,
  gastoMedio
}) {
  if (!perfil) return [];

  const alerts = [];

  // 🔴 Déficit real
  if (perfil.notify_deficit && saldoMes < 0) {
    alerts.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });
  }

  // 📉 Projeção negativa
  if (
    perfil.notify_projection_negative &&
    projecaoSaldoMes != null &&
    projecaoSaldoMes < 0
  ) {
    alerts.push({
      tipo: "alerta",
      icon: "📉",
      texto: "Projeção indica déficit até o fim do mês"
    });
  }

  // ⚠️ Sobra baixa
  if (
    perfil.notify_low_sobra &&
    perfil.min_sobra_alert != null &&
    saldoMes <= perfil.min_sobra_alert
  ) {
    alerts.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Sobra do mês abaixo do limite configurado"
    });
  }

  // 🟡 Gastos acima do padrão
  if (
    perfil.notify_abnormal_spending &&
    gastoMedio > 0 &&
    gastoAtual > gastoMedio
  ) {
    alerts.push({
      tipo: "alerta",
      icon: "📊",
      texto: "Gastos acima do padrão recente"
    });
  }

  // 🟣 Ritmo acelerado (placeholder)
  if (perfil.notify_spending_pace) {
    // depois refinamos
  }

  return alerts;
}
