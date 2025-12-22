import { supabase } from "./supabase";

/**
 * Busca o perfil do usuário logado.
 * Se não existir, cria automaticamente com os defaults do banco.
 */
export async function getUserProfile() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  // tenta buscar perfil
  const { data, error } = await supabase
    .from("user_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // perfil existe
  if (data) return data;

  // erro diferente de "não encontrado"
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  // não existe → cria
  const { data: created, error: insertError } = await supabase
    .from("user_profile")
    .insert({
      user_id: user.id
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

/**
 * Atualiza o perfil do usuário logado.
 * Recebe apenas os campos que devem ser alterados.
 */
export async function updateUserProfile(updates = {}) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("user_profile")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
