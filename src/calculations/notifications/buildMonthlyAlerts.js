import { money } from "../../utils/money";

export function buildMonthlyAlerts({ saldoMes }) {
  const alerts = [];

  if (typeof saldoMes === "number" && saldoMes < 0) {
    alerts.push({
      tipo: "deficit",
      icon: "🚨",
      texto: `Você fechou o mês com déficit de ${money(Math.abs(saldoMes))}.`
    });
  }

  return alerts;
}
