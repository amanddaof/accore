import { supabase } from "./supabase";

export async function getBills() {
  const { data, error } = await supabase.from("bills").select("*");
  if (error) throw error;
  return data || [];
}
