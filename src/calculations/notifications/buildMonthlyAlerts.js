/**
 * Gera avisos do mês com base:
 * - nos dados já calculados
 * - nas preferências do usuário
 */
export function buildMonthlyAlerts({
  perfil,
  saldoMes,            // número (pode ser negativo)
  projecaoSaldoMes,    // número
  gastoAtual,
  gastoMedio           // média histórica
}) {
  if (!perfil) return [];

  const avisos = [];

  // 1️⃣ Déficit no mês
  if (perfil.notify_deficit && saldoMes < 0) {
    avisos.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });
  }

  // 2️⃣ Projeção negativa
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

  // 3️⃣ Sobra muito baixa (SÓ SE NÃO FOR DÉFICIT)
  if (
    perfil.notify_low_sobra &&
    saldoMes > 0 &&                       // 🔴 CORREÇÃO AQUI
    saldoMes < perfil.min_sobra_alert
  ) {
    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Sobra do mês está muito baixa"
    });
  }

  // 4️⃣ Gastos acima do ritmo normal
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
