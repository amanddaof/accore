import { supabase } from "./supabase";

export async function getLoans() {
  const { data, error } = await supabase.from("loans").select("*");
  if (error) throw error;
  return data || [];
}
