import { money } from "../../utils/money";

/**
 * Gera avisos do mês selecionado
 * ATUALMENTE: apenas alerta de déficit
 */
export function buildMonthlyAlerts({
  saldoMes
}) {
  const alerts = [];

  // ==============================
  // 🚨 ALERTA DE DÉFICIT
  // ==============================
  if (typeof saldoMes === "number" && saldoMes < 0) {
    alerts.push({
      tipo: "deficit",
      icon: "🚨",
      texto: `Este mês fechou com déficit de ${money(Math.abs(saldoMes))}.`
    });
  }

  return alerts;
}
