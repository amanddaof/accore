import { supabase } from "./supabase";
import { calcularMesFatura } from "../calculations/cardClosing";
import { getCards } from "./cards.service";

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

// 🆕 SALVAR TRANSAÇÃO COM DATA REAL + FATURA CORRETA
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
      valor: payload.valor,
      quem: payload.quem,
      categoria: payload.categoria,
      origem: payload.origem,
      data_real: payload.data_real,
      mes
    });

  if (error) throw error;
}
