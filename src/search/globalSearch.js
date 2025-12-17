import { normalizeText } from "../utils/normalizeText";
import { money } from "../utils/money";

export function globalSearch({
  query,
  transactions = [],
  reservations = [],
  loans = [],
  houseBills = [],
}) {
  if (!query || query.length < 2) return [];

  const q = normalizeText(query);

  const results = [];

  // =========================
  // TRANSACTIONS
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
        value: t.valor,
        date: t.data_real,
        route: `/history?mes=${t.mes}`,
        weight: 3,
      });
    }
  });

  // =========================
  // RESERVATIONS
  // =========================
  reservations.forEach(r => {
    const text = normalizeText(
      `${r.descricao} reserva`
    );

    if (text.includes(q)) {
      results.push({
        type: "reservation",
        id: r.id,
        title: r.descricao,
        subtitle: "Reserva",
        value: r.valor,
        date: r.data,
        route: "/reservas",
        weight: 2,
      });
    }
  });

  // =========================
  // LOANS
  // =========================
  loans.forEach(l => {
    const text = normalizeText(
      `${l.descricao} emprestimo`
    );

    if (text.includes(q)) {
      results.push({
        type: "loan",
        id: l.id,
        title: l.descricao,
        subtitle: "Empréstimo",
        value: l.valor_total,
        route: "/emprestimos",
        weight: 1,
      });
    }
  });

  // =========================
  // ORDER BY RELEVANCE
  // =========================
  return results
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);
}
