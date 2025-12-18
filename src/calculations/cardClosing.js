import { isoParaMesAbrev } from "../core/dates";

export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card?.fechamento_dia) return "";

  const dataCompra = new Date(dataReal);

  let fechamentoDia = card.fechamento_dia;
  const offset = card.fechamento_offset || 0;

  // tenta fechamento no mesmo mês da compra
  let fechamento = new Date(
    dataCompra.getFullYear(),
    dataCompra.getMonth(),
    fechamentoDia
  );

  // ajuste para "último dia do mês"
  if (fechamentoDia === 31) {
    fechamento = new Date(
      dataCompra.getFullYear(),
      dataCompra.getMonth() + 1,
      0
    );
  }

  // aplica offset
  fechamento.setDate(fechamento.getDate() + offset);

  // se a compra ocorreu ANTES do fechamento,
  // o fechamento relevante foi no mês ANTERIOR
  if (dataCompra < fechamento) {
    fechamento.setMonth(fechamento.getMonth() - 1);
  }

  // 🔑 fatura = mês seguinte ao fechamento
  const anoFatura = fechamento.getMonth() === 11
    ? fechamento.getFullYear() + 1
    : fechamento.getFullYear();

  const mesFatura = (fechamento.getMonth() + 1) % 12;

  const iso = `${anoFatura}-${String(mesFatura + 1).padStart(2, "0")}`;

  return isoParaMesAbrev(iso);
}
