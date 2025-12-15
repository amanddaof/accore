import { supabase } from "./supabase";
import { dataRealParaMesAbrev } from "../core/dates";

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

// ✅ NOVO — NÃO SUBSTITUI NADA
export async function criarTransaction(dados) {
  const mes = dataRealParaMesAbrev(dados.data_real);

  const { error } = await supabase
    .from("transactions")
    .insert({
      ...dados,
      mes
    });

  if (error) throw error;
}
