import { supabase } from "./supabase";

export async function getLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function marcarParcelaComoPaga(id) {
  const { error } = await supabase
    .from("loans")
    .update({ pago: true })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar parcela como paga:", error);
    throw error;
  }
}
