import { supabase } from "./supabase";

// busca histórico completo
export async function getSalaryHistory() {
  const { data, error } = await supabase
    .from("salary_history")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw error;
  return data || [];
}

// adiciona salário
export async function addSalary({ data, quem, valor }) {
  const { error } = await supabase
    .from("salary_history")
    .insert([{ data, quem, valor }]);

  if (error) throw error;
}

export async function updateSalary(id, payload) {
  const { error } = await supabase
    .from("salary_history")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSalary(id) {
  const { error } = await supabase
    .from("salary_history")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
