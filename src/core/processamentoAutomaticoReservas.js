export async function processarReservasAutomaticamente({
  buscarTodos,
  inserir,
  atualizar,
  avancarDataReserva,
  avancarMesReserva
}) {

  const hoje = new Date();
  const hojeFormatado =
    hoje.getFullYear() + "-" +
    String(hoje.getMonth() + 1).padStart(2, "0") + "-" +
    String(hoje.getDate()).padStart(2, "0");

  const reservas = await buscarTodos("reservas");

  const reservasParaProcessar = reservas.filter(
    r => r.data_real <= hojeFormatado
  );

  for (const reserva of reservasParaProcessar) {

    // 1️⃣ Inserir nova transação
    await inserir("transacoes", [{
      descricao: reserva.descricao,
      valor: Number(reserva.valor),
      data_real: reserva.data_real,
      mes: reserva.mes,
      parcelas: reserva.parcelas || "1/1",
      quem: reserva.quem,
      quem_paga: reserva.quem_paga,
      status: "Pendente",
      category_id: reserva.category_id,
      origem: reserva.origem
    }]);

    // 2️⃣ Calcular nova data e novo mês
    const novaData = avancarDataReserva(
      reserva.data_real,
      reserva.recorrencia
    );

    const novoMes = avancarMesReserva(
      reserva.mes,
      reserva.recorrencia
    );

    // 3️⃣ Atualizar reserva
    await atualizar("reservas", reserva.id, {
      data_real: novaData,
      mes: novoMes
    });
  }
}