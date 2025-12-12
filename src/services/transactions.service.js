import { supabase } from "./supabase";

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
