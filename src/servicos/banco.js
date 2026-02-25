import { supabase } from "./supabase";

/**
 * Mapeamento oficial:
 * nome usado no código -> nome real no banco
 */
const TABELAS = {
  contas: "bills",
  cartoes: "cards",
  categorias: "categories",
  emprestimos: "loans",
  pagamentos: "payments",
  reservas: "reservations",
  historico_salarios: "salary_history",
  meta_economia: "savings_goal",
  economia_anual: "savings_yearly",
  transacoes: "transactions",
  perfil_usuario: "user_profile",
};

/**
 * Retorna o nome real da tabela
 */
function tabela(nomeLogico) {
  const real = TABELAS[nomeLogico];
  if (!real) {
    throw new Error(`Tabela não mapeada: ${nomeLogico}`);
  }
  return real;
}

/* ============================
   FUNÇÕES GENÉRICAS
============================ */

export async function buscarTodos(nomeTabela) {
  const { data, error } = await supabase
    .from(tabela(nomeTabela))
    .select("*");

  if (error) throw error;
  return data;
}

export async function buscarPorId(nomeTabela, id) {
  const { data, error } = await supabase
    .from(tabela(nomeTabela))
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function inserir(nomeTabela, valores) {
  const { data, error } = await supabase
    .from(tabela(nomeTabela))
    .insert(valores)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function atualizar(nomeTabela, id, valores) {
  const { data, error } = await supabase
    .from(tabela(nomeTabela))
    .update(valores)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function remover(nomeTabela, id) {
  const { error } = await supabase
    .from(tabela(nomeTabela))
    .delete()
    .eq("id", id);

  if (error) throw error;
}
