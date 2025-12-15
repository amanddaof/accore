import { calcularDiaFechamento } from "./cardClosing";

/**
 * Calcula o mês da fatura (ex: "Jan/26")
 * com base na data real da compra e no cartão
 */
export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card) return null;

  const data = new Date(dataReal);
  const ano = data.getFullYear();
  const mesIndex = data.getMonth(); // 0–11
  const diaCompra = data.getDate();

  // dia real de fechamento do cartão naquele mês
  const diaFechamento = calcularDiaFechamento(card, ano, mesIndex);

  // se comprou NO DIA DO FECHAMENTO ou depois → próxima fatura
  const vaiProximoMes = diaCompra >= diaFechamento;

  const fatura = new Date(ano, mesIndex + (vaiProximoMes ? 2 : 1), 1);

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  return `${meses[fatura.getMonth()]}/${String(fatura.getFullYear()).slice(2)}`;
}
