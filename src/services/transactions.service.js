import { supabase } from "./supabase";
import { calcularMesFatura } from "../calculations/cardInvoice";
import { getCards } from "./cards.service";

/**
 * 🔹 BUSCAR TODAS AS TRANSAÇÕES (PAGINADO)
 */
export async function getTransactions() {
  let todos = [];
  let offset = 0;
  const LIMITE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categoria:category_id (
          id,
          name,
          color,
          active
        )
      `)
      .range(offset, offset + LIMITE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    todos.push(...data);
    offset += LIMITE;
  }

  return todos;
}

/**
 * 🆕 CRIAR TRANSAÇÃO
 * - Recebe data_real
 * - Calcula automaticamente o mês da fatura
 */
export async function createTransaction(payload) {
  const cards = await getCards();
  const card = cards.find(c => c.nome === payload.origem);

  if (!card) {
    throw new Error("Cartão não encontrado para calcular fatura");
  }

  const mes = calcularMesFatura({
    dataReal: payload.data_real,
    card
  });

  const { error } = await supabase
    .from("transactions")
    .insert({
      descricao: payload.descricao,
      valor: Number(payload.valor),
      quem: payload.quem,
      category_id: payload.category_id || null,
      origem: payload.origem,
      data_real: payload.data_real,
      mes,
      status: payload.status || "Pendente",
      parcelas: payload.parcelas || "1/1"
    });

  if (error) throw error;
}
