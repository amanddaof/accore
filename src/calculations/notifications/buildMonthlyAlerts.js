export function buildMonthlyAlerts({
  perfil,
  saldoMes
}) {
  const avisos = [];

  if (!perfil) return avisos;

  const limiteSobra = Number(perfil.min_sobra_alerta || 0);

  /* ======================================================
     1️⃣ DÉFICIT DO MÊS (MAIOR PRIORIDADE)
  ====================================================== */
  if (perfil.notify_deficit && saldoMes < 0) {
    avisos.push({
      tipo: "danger",
      icon: "🚨",
      texto: "Déficit neste mês. Os gastos superaram o valor disponível."
    });

    return avisos; // ⛔ não avalia mais nada
  }

  /* ======================================================
     2️⃣ SOBRA ZERADA
  ====================================================== */
  if (perfil.notify_low_sobra && saldoMes === 0) {
    avisos.push({
      tipo: "warning",
      icon: "⚠️",
      texto: "Sobra zerada neste mês. Qualquer novo gasto deixará o saldo negativo."
    });

    return avisos; // ⛔ não avalia sobra baixa
  }

  /* ======================================================
     3️⃣ SOBRA MUITO BAIXA (CONFIGURÁVEL)
  ====================================================== */
  if (
    perfil.notify_low_sobra &&
    saldoMes > 0 &&
    limiteSobra > 0 &&
    saldoMes <= limiteSobra
  ) {
    avisos.push({
      tipo: "warning",
      icon: "⚠️",
      texto: `Sobra baixa neste mês. Restam apenas ${saldoMes.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}.`
    });
  }

  return avisos;
}
