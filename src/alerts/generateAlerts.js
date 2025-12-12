export function generateAlerts({ mensal, categorias, dividas, cards }) {
  const alerts = [];

  // ---- DÍVIDA ----
  if (dividas?.valor > 0) {
    alerts.push({
      type: "danger",
      text: `Dívida ativa: ${dividas.devedor} deve R$ ${dividas.valor.toFixed(2)} para ${dividas.credor}`
    });
  }

  // ---- CARTÕES NÃO CONFIGURADOS ----
  if (!cards || cards.length === 0) {
    alerts.push({
      type: "warning",
      text: "Nenhum cartão configurado"
    });
  }

  // ---- CARTÕES SEM LIMITE ----
  cards?.forEach(card => {
    if (!card.limite || card.limite === 0) {
      alerts.push({
        type: "warning",
        text: `Cartão ${card.nome} sem limite configurado`
      });
    }
  });

  // ---- CATEGORIA ALTA ----
  const maisAlta = categorias?.ambos?.[0];
  if (maisAlta && maisAlta.valor > 1500) {
    alerts.push({
      type: "warning",
      text: `Gasto alto em ${maisAlta.categoria}: R$ ${maisAlta.valor.toFixed(2)}`
    });
  }

  // ---- TOTAL MENSAL ----
  if (mensal?.total > 6000) {
    alerts.push({
      type: "danger",
      text: "Gasto mensal muito acima do esperado"
    });
  }

  // ---- NADA GRAVE ----
  if (alerts.length === 0) {
    alerts.push({
      type: "ok",
      text: "Tudo sob controle ✅"
    });
  }

  return alerts;
}
