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
  if (saldoMes < 0) {
    avisos.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });
    return avisos; // Para aqui se tiver déficit
  }

  /* =========================
     2️⃣ STATUS DA SOBRA (SEMPRE MOSTRA)
  ========================= */
  const minSobra = Number(perfil.min_sobra_alert || 0);
  
  if (saldoMes >= 0) {
    if (saldoMes < minSobra) {
      avisos.push({
        tipo: "alerta",
        icon: "⚠️",
        texto: "Sobra abaixo do configurado"
      });
    } else {
      avisos.push({
        tipo: "sucesso",
        icon: "✅",
        texto: "Sobra acima do configurado"
      });
    }
  }

  /* =========================
     3️⃣ PROJEÇÃO NEGATIVA (adicional)
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
