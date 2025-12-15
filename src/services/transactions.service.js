import { supabase } from "./supabase";

// ========================
// 🔎 BUSCAR TRANSAÇÕES
// ========================
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

// ========================
// ➕ CRIAR TRANSAÇÃO
// ========================
export async function createTransaction(payload) {
  const data = new Date(payload.data_real);

  const mes = data.toLocaleString("pt-BR", {
    month: "short"
  }) + "/" + String(data.getFullYear()).slice(2);

  const { error } = await supabase
    .from("transactions")
    .insert({
      ...payload,
      mes
    });

  if (error) throw error;
}
