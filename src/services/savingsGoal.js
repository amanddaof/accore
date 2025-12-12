import { supabase } from "./supabase";

/**
 * Busca a meta de economia do ano.
 * @param {number} ano - Ex: 2025
 */
export async function getSavingsGoal(ano) {
  const { data, error } = await supabase
    .from("savings_goal")
    .select("valor")
    .eq("ano", ano)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar meta:", error);
    return null;
  }

  // nada encontrado
  if (!data || data.valor === undefined || data.valor === null) {
    return null;
  }

  // converter sempre para número (numeric vem como string)
  const valor = Number(data.valor);

  return { valor };
}


/**
 * Salva ou atualiza a meta anual.
 * @param {number} ano - Ex: 2025
 * @param {number} valor - Meta em reais
 */
export async function saveSavingsGoal(ano, valor) {
  const { error } = await supabase
    .from("savings_goal")
    .upsert(
      { ano, valor },   // ✔ envia os dados
      { onConflict: "ano" } // ✔ garante update em vez de insert duplicado
    );

  if (error) {
    console.error("Erro ao salvar meta:", error);
    throw error;
  }
}
