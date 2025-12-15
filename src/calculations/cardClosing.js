import { isoParaMesAbrev } from "../core/dates";

export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card?.fechamento_dia) return null;

  const data = new Date(dataReal);
  let ano = data.getFullYear();
  let mes = data.getMonth(); // 0–11
  const diaCompra = data.getDate();

  let fechamento = card.fechamento_dia;

  // último dia do mês
  if (fechamento === 31) {
    fechamento = new Date(ano, mes + 1, 0).getDate();
  }

  // Nubank ou similares
  fechamento += card.fechamento_offset || 0;

  let mesFatura;

  // 🔴 CASO ESPECIAL: FECHAMENTO DIA 1
  if (fechamento <= 1) {
    // padrão: próximo mês
    mesFatura = mes + 1;

    // Nubank: último dia já pula mais um mês
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    if (diaCompra >= ultimoDiaMes) {
      mesFatura += 1;
    }
  }
  else {
    // 🔵 REGRA NORMAL
    mesFatura = mes + 1;

    if (diaCompra >= fechamento) {
      mesFatura += 1;
    }
  }

  if (mesFatura > 11) {
    mesFatura -= 12;
    ano += 1;
  }

  return isoParaMesAbrev(
    `${ano}-${String(mesFatura + 1).padStart(2, "0")}`
  );
}
