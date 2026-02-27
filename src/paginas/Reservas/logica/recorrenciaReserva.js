const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function avancarDataReserva(dataStr, recorrencia) {
  if (!dataStr) return null;

  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);

  switch (recorrencia) {
    case "Mensal":
      data.setMonth(data.getMonth() + 1);
      break;
    case "Bimestral":
      data.setMonth(data.getMonth() + 2);
      break;
    case "Trimestral":
      data.setMonth(data.getMonth() + 3);
      break;
    case "Parcelado":
      data.setMonth(data.getMonth() + 1);
      break;
    case "Única":
      return null;
    default:
      data.setMonth(data.getMonth() + 1);
  }

  const anoNovo = data.getFullYear();
  const mesNovo = String(data.getMonth() + 1).padStart(2, "0");
  const diaNovo = String(data.getDate()).padStart(2, "0");

  return `${anoNovo}-${mesNovo}-${diaNovo}`;
}

export function avancarMesReserva(mesAtual, recorrencia) {
  if (!mesAtual) return null;

  const [mesAbrev, anoAbrev] = mesAtual.split("/");
  const mesIndex = MESES.indexOf(mesAbrev);
  if (mesIndex === -1) return mesAtual;

  const data = new Date(2000 + Number(anoAbrev), mesIndex);

  switch (recorrencia) {
    case "Mensal":
      data.setMonth(data.getMonth() + 1);
      break;
    case "Bimestral":
      data.setMonth(data.getMonth() + 2);
      break;
    case "Trimestral":
      data.setMonth(data.getMonth() + 3);
      break;
    case "Parcelado":
      data.setMonth(data.getMonth() + 1);
      break;
    default:
      return mesAtual;
  }

  return `${MESES[data.getMonth()]}/${String(data.getFullYear()).slice(2)}`;
}

export function avancarParcelaReserva(reserva) {
  if (reserva.recorrencia !== "Parcelado") return reserva.parcelas;

  const [atual, total] = (reserva.parcelas || "1/1").split("/").map(Number);

  if (atual >= total) return null;

  return `${atual + 1}/${total}`;
}