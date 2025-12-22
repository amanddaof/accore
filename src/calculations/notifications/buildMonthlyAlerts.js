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
  console.log("🔎 buildMonthlyAlerts → perfil:", perfil);
  console.log("🔎 buildMonthlyAlerts → saldoMes:", saldoMes);
  console.log("🔎 buildMonthlyAlerts → projecaoSaldoMes:", projecaoSaldoMes);
  console.log("🔎 buildMonthlyAlerts → gastoAtual:", gastoAtual);
  console.log("🔎 buildMonthlyAlerts → gastoMedio:", gastoMedio);

  if (!perfil) {
    console.warn("⚠️ buildMonthlyAlerts → perfil ausente, nenhum aviso gerado");
    return [];
  }

  const avisos = [];

  // 1️⃣ Déficit no mês
  if (perfil.notify_deficit && saldoMes < 0) {
    console.log("✅ Aviso gerado: Déficit no mês");

    avisos.push({
      tipo: "erro",
      icon: "🔴",
      texto: "Déficit neste mês"
    });
  } else {
    console.log(
      "❌ Déficit NÃO gerado →",
      "notify_deficit:", perfil.notify_deficit,
      "| saldoMes < 0:", saldoMes < 0
    );
  }

  // 2️⃣ Projeção negativa
  if (
    perfil.notify_projection_negative &&
    typeof projecaoSaldoMes === "number" &&
    projecaoSaldoMes < 0
  ) {
    console.log("✅ Aviso gerado: Projeção negativa");

    avisos.push({
      tipo: "erro",
      icon: "📉",
      texto: "Projeção indica déficit até o fim do mês"
    });
  } else {
    console.log(
      "❌ Projeção NÃO gerada →",
      "notify_projection_negative:", perfil.notify_projection_negative,
      "| projecaoSaldoMes:", projecaoSaldoMes
    );
  }

  // 3️⃣ Sobra muito baixa (SÓ SE NÃO FOR DÉFICIT)
  if (
    perfil.notify_low_sobra &&
    saldoMes > 0 &&
    saldoMes < perfil.min_sobra_alert
  ) {
    console.log("✅ Aviso gerado: Sobra muito baixa");

    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Sobra do mês está muito baixa"
    });
  } else {
    console.log(
      "❌ Sobra baixa NÃO gerada →",
      "notify_low_sobra:", perfil.notify_low_sobra,
      "| saldoMes:", saldoMes,
      "| min_sobra_alert:", perfil.min_sobra_alert
    );
  }

  // 4️⃣ Gastos acima do ritmo normal
  if (
    perfil.notify_abnormal_spending &&
    gastoMedio > 0 &&
    gastoAtual > gastoMedio * (perfil.gasto_alert_percent / 100)
  ) {
    console.log("✅ Aviso gerado: Gastos fora do padrão");

    avisos.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: "Gastos acima do padrão recente"
    });
  } else {
    console.log(
      "❌ Gastos fora do padrão NÃO gerado →",
      "notify_abnormal_spending:", perfil.notify_abnormal_spending,
      "| gastoAtual:", gastoAtual,
      "| gastoMedio:", gastoMedio,
      "| limite:", gastoMedio * (perfil.gasto_alert_percent / 100)
    );
  }

  console.log("📌 buildMonthlyAlerts → avisos finais:", avisos);

  return avisos;
}
