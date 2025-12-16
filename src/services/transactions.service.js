import { supabase } from "./supabase";

/**
 * 🔹 BUSCAR TODAS AS TRANSAÇÕES (PAGINADO)
 * (mantém como está, sem mudanças)
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
 * ✅ Usa APENAS data_real
 * ❌ Não calcula mês
 * ❌ Não depende de cartão
 * ❌ Não aplica regra de negócio
 */
export async function createTransaction(payload) {
  if (!payload.data_real) {
    throw new Error("Data real é obrigatória");
  }

  const { error } = await supabase
    .from("transactions")
    .insert({
      descricao: payload.descricao,
      valor: Number(payload.valor),
      quem: payload.quem,
      category_id: payload.category_id || null,
      origem: payload.origem,
      data_real: payload.data_real,

      // 🧯 legado — NÃO usado, NÃO calculado
      mes: payload.mes || null,

      status: payload.status || "Pendente",
      parcelas: payload.parcelas || "1/1",
    });

  if (error) throw error;
}
