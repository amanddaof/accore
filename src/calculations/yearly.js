import { isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";
import { calcularReservasProjetadasParaMes } from "./monthly";

// ========================
// 📂 PESO POR PESSOA
// ========================
export function pesoCategoria(quem, pessoa) {
  if (pessoa === "Ambos") {
    return quem === "Ambos" ? 2 : 1;
  }
  if (quem === "Ambos") return 1;
  return quem === pessoa ? 1 : 0;
}

// ========================
// 📊 CATEGORIAS MENSAIS
// ========================
export function calcularCategoriasMes(
  mesFiltroISO,
  pessoa,
  {
    transactions = [],
    reservas = [],
    cards = []
  }
) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  const total = {};

  // transforma categoria em { name, color }
  function normalizarCategoria(categoria) {
    if (!categoria) return { name: "Outros", color: "#888" };

    // caso venha do join (Supabase)
    if (typeof categoria === "object") {
      return {
        name: categoria.name || `Categoria ${categoria.id}`,
        color: categoria.color || "#888"
      };
    }

    // se vier apenas o ID
    return { name: `Categoria ${categoria}`, color: "#888" };
  }

  function acumular(categoria, valor) {
    const { name, color } = normalizarCategoria(categoria);

    if (!total[name]) {
      total[name] = { valor: 0, color };
    }

    total[name].valor += safeNumber(valor);
  }

  // ========================
  // 🔹 TRANSAÇÕES
  // ========================
  transactions.forEach(t => {
    if (t.mes !== mesFmt) return;

    const peso = pesoCategoria(t.quem, pessoa);
    if (!peso) return;

    const cat = t.categoria ?? t.category_id;
    acumular(cat, safeNumber(t.valor) * peso);
  });

  // ========================
  // 🔹 RESERVAS PROJETADAS
  // ========================
  const proj = calcularReservasProjetadasParaMes(
    mesFiltroISO,
    reservas,
    cards
  );

  proj.forEach(r => {
    const peso = pesoCategoria(r.quem, pessoa);
    if (!peso) return;

    const cat = r.categoria ?? r.category_id;
    acumular(cat, safeNumber(r.valor) * peso);
  });

  // retorno no formato certo para o gráfico
  return Object.entries(total)
    .map(([categoria, obj]) => ({
      categoria,
      valor: obj.valor,
      color: obj.color
    }))
    .filter(i => i.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

// ========================
// 📈 COMPARATIVO
// ========================
export function compararCategoriasMes(mesAtualISO, pessoa, dados) {

  function mesAnterior(m) {
    const [ano, mes] = m.split("-").map(Number);
    const d = new Date(ano, mes - 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  const atual = calcularCategoriasMes(mesAtualISO, pessoa, dados);
  const anterior = calcularCategoriasMes(
    mesAnterior(mesAtualISO),
    pessoa,
    dados
  );

  const todas = new Set([
    ...atual.map(i => i.categoria),
    ...anterior.map(i => i.categoria)
  ]);

  return [...todas]
    .map(cat => {
      const a = atual.find(i => i.categoria === cat)?.valor || 0;
      const p = anterior.find(i => i.categoria === cat)?.valor || 0;

      return {
        categoria: cat,
        atual: a,
        anterior: p,
        diferenca: a - p
      };
    })
    .sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca));
}
