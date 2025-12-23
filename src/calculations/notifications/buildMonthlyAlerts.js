import { money } from "../../utils/money";

/**
 * Gera notificações do mês selecionado
 * ⚠️ ATUALMENTE: apenas notificação de déficit
 */
export function buildMonthlyAlerts({
  mes,
  salarios,
  gastos,
  reservas
}) {
  const alerts = [];

  // ==============================
  // 🧮 Cálculo da sobra do mês
  // ==============================
  const totalSalarios = salarios?.total || 0;
  const totalGastos = gastos?.total || 0;
  const totalReservas = reservas?.total || 0;

  const sobraFinal = totalSalarios - totalGastos - totalReservas;

  // ==============================
  // 🚨 ALERTA DE DÉFICIT
  // ==============================
  if (sobraFinal < 0) {
    alerts.push({
      type: "deficit",
      level: "danger",
      title: "Mês em déficit",
      message: `Este mês fechou com déficit de ${money(Math.abs(sobraFinal))}.`,
      mes
    });
  }

  return alerts;
}
