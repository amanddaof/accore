import { supabase } from "./supabase";

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function addCategory({ name, color }) {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, color, active: true }])
    .select();

  if (error) {
    console.error("Erro ao salvar:", error);
    throw error;
  }

  return data;
}

export async function updateCategory(id, fields) {
  const { error } = await supabase
    .from("categories")
    .update(fields)
    .eq("id", id);

  if (error) throw error;
}
