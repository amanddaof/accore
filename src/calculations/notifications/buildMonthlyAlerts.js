export function buildMonthlyAlerts({
  perfil,
  saldoMes,            // número real do mês
  projecaoSaldoMes,    // número ou null
  gastoAtual,
  gastoMedio
}) {
  if (!perfil) return [];

  const avisos = [];

  /* =========================
     1️⃣ DÉFICIT REAL
     ========================= */
  if (perfil.notify_deficit && saldoMes < 0) {
    avisos.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });

    // ⛔ nada mais faz sentido
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

    // ⛔ não avalia sobra baixa
    return avisos;
  }

  /* =========================
     3️⃣ SOBRA BAIXA (POSITIVA)
     ========================= */
  if (
    perfil.notify_low_sobra &&
    saldoMes > 0 &&
    typeof perfil.min_sobra_alert === "number" &&
    saldoMes < perfil.min_sobra_alert
  ) {
    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Sobra do mês abaixo do valor mínimo configurado"
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
