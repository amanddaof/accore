import { supabase } from "./supabase";
// calcularMesFatura e isoParaMesAbrev não são mais usados
// import { calcularMesFatura } from "../calculations/cardInvoice";
// import { incrementarMes, isoParaMesAbrev } from "../core/dates";

/**
 * Processa automaticamente reservas vencidas
 */
export async function processarReservasPendentes(cards = []) {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: reservas, error } = await supabase
    .from("reservations")
    .select("*")
    .lte("data_real", hoje)
    .neq("recorrencia", "Concluída");

  if (error) {
    console.error("Erro ao buscar reservas:", error);
    return;
  }

  for (const r of reservas) {
    await processarReserva(r, cards);
  }
}

/**
 * Processa UMA reserva (mesma lógica do botão)
 */
async function processarReserva(r, cards) {

  // resolve cartão (ou externo) – mantém se ainda usar em outro lugar
  const card = cards.find(c => c.nome === r.origem) || null;

  // agora o mês vem DIRETO da reserva
  const mes = r.mes;

  // 1️⃣ cria a transação
  const { error: e1 } = await supabase
    .from("transactions")
    .insert([{
      descricao: r.descricao,
      valor: Number(r.valor),
      mes,                                  // <-- usa r.mes
      parcelas: r.recorrencia === "Parcelado" ? r.parcelas : "1/1",
      quem: r.quem || "Amanda",
      quem_paga: r.quem_paga || null,
      status: "Pendente",
      category_id: r.category_id || null,
      origem: r.origem || "Externo",
      data_real: r.data_real
    }]);

  if (e1) {
    console.error("Erro ao criar transação:", e1);
    return;
  }

  // 2️⃣ calcula próxima data_real
  const proxData = calcularProximaData(r);

  // 3️⃣ atualiza reserva
  const payload = proxData
    ? { data_real: proxData }
    : { recorrencia: "Concluída" };

  const { error: e2 } = await supabase
    .from("reservations")
    .update(payload)
    .eq("id", r.id);

  if (e2) {
    console.error("Erro ao atualizar reserva:", e2);
  }
}

/**
 * Avança data_real conforme recorrência
 */
function calcularProximaData(r) {
  const base = new Date(r.data_real);

  switch (r.recorrencia) {
    case "Mensal":
      base.setMonth(base.getMonth() + 1);
      break;
    case "Bimestral":
      base.setMonth(base.getMonth() + 2);
      break;
    case "Trimestral":
      base.setMonth(base.getMonth() + 3);
      break;
    case "Parcelado": {
      const [a, t] = (r.parcelas || "1/1").split("/").map(Number);
      if (a >= t) return null;

      base.setMonth(base.getMonth() + 1);
      break;
    }
    case "Única":
      return null;
    default:
      base.setMonth(base.getMonth() + 1);
  }

  return base.toISOString().slice(0, 10);
}
