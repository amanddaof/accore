import { supabase } from "./supabase";

/**
 * Busca a meta de economia do ano.
 * @param {number} ano - Ex: 2025
 */
export async function getSavingsGoal(ano) {
  const { data, error } = await supabase
    .from("savings_goal")
    .select("*")
    .eq("ano", ano)
    .single();

  // Se não existir meta, retorna null sem quebrar
  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar meta:", error);
    throw error;
  }

  return data || null;
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
      { ano, valor },
      { onConflict: "ano" }
    );

  if (error) {
    console.error("Erro ao salvar meta:", error);
    throw error;
  }
}
