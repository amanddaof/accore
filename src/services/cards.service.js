import { supabase } from "./supabase";

export async function getCards() {
  const { data, error } = await supabase.from("cards").select("*");
  if (error) throw error;
  return data || [];
}

export async function salvarLimite(id, limite) {
  const { error } = await supabase.from("cards").update({ limite }).eq("id", id);
  if (error) throw error;
}
