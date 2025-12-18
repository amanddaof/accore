import { isoParaMesAbrev } from "../core/dates";

export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card?.fechamento_dia) return null;

  const data = new Date(dataReal);
  let ano = data.getFullYear();
  let mes = data.getMonth();
  const diaCompra = data.getDate();

  let fechamento = card.fechamento_dia;

  if (fechamento === 31) {
    fechamento = new Date(ano, mes + 1, 0).getDate();
  }

  fechamento += card.fechamento_offset || 0;

  // 🔑 1. determina o mês do fechamento
  let mesFechamento = mes;
  if (diaCompra > fechamento) {
    mesFechamento = mes + 1;
  }

  // 🔑 2. fatura é o mês seguinte ao fechamento
  let mesFatura = mesFechamento + 1;

  if (mesFatura > 11) {
    mesFatura -= 12;
    ano += 1;
  }

  return isoParaMesAbrev(new Date(ano, mesFatura, 1));
}