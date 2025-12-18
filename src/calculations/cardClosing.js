import { isoParaMesAbrev } from "../core/dates";

export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card?.fechamento_dia) return null;

  const data = new Date(dataReal);

  let ano = data.getFullYear();
  let mes = data.getMonth(); // 0–11
  const diaCompra = data.getDate();

  let fechamento = card.fechamento_dia;

  // caso especial: cartões que fecham no "último dia do mês"
  if (fechamento === 31) {
    fechamento = new Date(ano, mes + 1, 0).getDate();
  }

  // offset (ex: Nubank)
  fechamento += card.fechamento_offset || 0;

  /**
   * 🔑 PASSO 1
   * Determina o mês em que ocorreu o FECHAMENTO
   */
  let mesFechamento = mes;

  // se a compra ocorreu após o fechamento,
  // então o fechamento relevante é o próximo
  if (diaCompra > fechamento) {
    mesFechamento = mes + 1;
  }

  /**
   * 🔑 PASSO 2
   * A fatura é sempre o mês seguinte ao fechamento
   */
  let mesFatura = mesFechamento + 1;

  // ajuste de virada de ano
  if (mesFatura > 11) {
    mesFatura -= 12;
    ano += 1;
  }

  return isoParaMesAbrev(new Date(ano, mesFatura, 1));
}