import { supabase } from "../../../servicos/supabase";
import { buscarTodos } from "../../../servicos/banco";
import { calcularResumo } from "./calcularResumo";

export async function buscarResumoMes(mesStr) {

  const [
    { data: transacoesMes = [] },
    { data: contasMes = [] },
    { data: emprestimosMes = [] },
    { data: reservas = [] },
    historicoSalarios
  ] = await Promise.all([
    supabase.from("transactions").select("*").eq("mes", mesStr),
    supabase.from("bills").select("*").eq("mes", mesStr),
    supabase.from("loans").select("*").eq("mes", mesStr),
    supabase.from("reservations").select("*"),
    buscarTodos("historico_salarios"),
  ]);

  return calcularResumo({
    mesSelecionado: mesStr,
    transacoesMes,
    reservas,
    contasMes,
    emprestimosMes,
    historicoSalarios,
  });
}