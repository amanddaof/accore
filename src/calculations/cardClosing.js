import { isoParaMesAbrev } from "../core/dates";

export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card?.fechamento_dia) return null;

  const data = new Date(dataReal);
  let ano = data.getFullYear();
  let mes = data.getMonth(); // 0–11
  const diaCompra = data.getDate();

  // 1️⃣ dia real de fechamento
  let fechamento = card.fechamento_dia;

  // fechamento no último dia do mês
  if (fechamento === 31) {
    fechamento = new Date(ano, mes + 1, 0).getDate();
  }

  fechamento += card.fechamento_offset || 0;

  // 2️⃣ regra correta da fatura
  let mesFatura = mes + 1; // padrão: mês seguinte ao atual

  if (diaCompra >= fechamento) {
    mesFatura += 1; // pula mais um mês
  }

  if (mesFatura > 11) {
    mesFatura -= 12;
    ano += 1;
  }

  const mesISO = `${ano}-${String(mesFatura + 1).padStart(2, "0")}`;

  return isoParaMesAbrev(mesISO); // ex: Jan/26
}
