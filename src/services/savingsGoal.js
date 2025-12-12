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
    .maybeSingle();  // ✔ mais seguro que .single()

  // Se não existe meta, retorna null sem erro
  if (error) {
    // Erros de "registro não encontrado" são esperados
    const ignorable = ["PGRST116", "PGRST204", "PGRST007"];
    if (ignorable.includes(error.code)) {
      return null;
    }

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
      { ano, valor },   // ✔ envia os dados
      { onConflict: "ano" } // ✔ garante update em vez de insert duplicado
    );

  if (error) {
    console.error("Erro ao salvar meta:", error);
    throw error;
  }
}
