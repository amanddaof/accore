import { supabase } from "./supabase";

export async function saveSavings({ ano, mes, pessoa, valor }) {
  const { data, error } = await supabase
    .from("savings_yearly")
    .insert([{ ano, mes, pessoa, economizado_real: valor }]);

  if (error) throw error;
  return data;
}

export async function getSavingsByYear(ano) {
  const { data, error } = await supabase
    .from("savings_yearly")
    .select("*")
    .eq("ano", ano);

  if (error) throw error;
  return data || [];
}
