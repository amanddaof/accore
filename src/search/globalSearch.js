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
      `${t.descricao || ""} ${t.cartao || ""}`
    );

    if (text.includes(q)) {
      results.push({
        type: "transaction",
        id: t.id,
        title: t.descricao || "Transação",
        subtitle: t.cartao || "Lançamentos",
        route: "/new", // ✅ rota segura
        weight: 4
      });
    }
  });

  // =========================
  // RESERVAS
  // =========================
  reservations.forEach(r => {
    const text = normalizeText(r.descricao || "");

    if (text.includes(q)) {
      results.push({
        type: "reservation",
        id: r.id,
        title: r.descricao,
        subtitle: "Reservas",
        route: "/reservas", // ✅ rota existente
        weight: 3
      });
    }
  });

  // =========================
  // CONTAS DA CASA
  // =========================
  bills.forEach(b => {
    const text = normalizeText(
      b.descricao || b.nome || ""
    );

    if (text.includes(q)) {
      results.push({
        type: "bill",
        id: b.id,
        title: b.descricao || b.nome,
        subtitle: "Contas da casa",
        route: "/contas", // ✅ rota correta
        weight: 2
      });
    }
  });

  // =========================
  // EMPRÉSTIMOS
  // =========================
  loans.forEach(l => {
    const text = normalizeText(l.descricao || l.nome || "");

    if (text.includes(q)) {
      results.push({
        type: "loan",
        id: l.id,
        title: l.descricao || l.nome,
        subtitle: "Empréstimos",
        route: "/cards", // ✅ rota existente
        weight: 1
      });
    }
  });

  return results
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);
}
