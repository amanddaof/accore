import { normalizeText } from "../utils/normalizeText";

export function globalSearch({
  query,
  transactions = [],
  reservations = [],
  bills = [],
  loans = []
}) {
  if (!query || query.length < 2) return [];

  const q = normalizeText(query);
  const results = [];

  // =========================
  // TRANSAÇÕES
  // =========================
  transactions.forEach(t => {
    const text = normalizeText(
      `${t.descricao} ${t.categoria} ${t.cartao}`
    );

    if (text.includes(q)) {
      results.push({
        type: "transaction",
        id: t.id,
        title: t.descricao,
        subtitle: `${t.cartao || "Externo"} • ${t.mes}`,
        route: `/history?mes=${t.mes}`,
        weight: 4
      });
    }
  });

  // =========================
  // RESERVAS
  // =========================
  reservations.forEach(r => {
    const text = normalizeText(r.descricao);

    if (text.includes(q)) {
      results.push({
        type: "reservation",
        id: r.id,
        title: r.descricao,
        subtitle: "Reserva",
        route: "/reservas",
        weight: 3
      });
    }
  });

  // =========================
  // CONTAS DA CASA
  // =========================
  bills.forEach(b => {
    const text = normalizeText(b.descricao);

    if (text.includes(q)) {
      results.push({
        type: "bill",
        id: b.id,
        title: b.descricao,
        subtitle: "Conta da casa",
        route: "/casa",
        weight: 2
      });
    }
  });

  // =========================
  // EMPRÉSTIMOS
  // =========================
  loans.forEach(l => {
    const text = normalizeText(l.descricao);

    if (text.includes(q)) {
      results.push({
        type: "loan",
        id: l.id,
        title: l.descricao,
        subtitle: "Empréstimo",
        route: "/emprestimos",
        weight: 1
      });
    }
  });

  return results
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);
}
