// src/calculations/cardClosing.js

/**
 * Calcula o dia real de fechamento da fatura
 * considerando meses com 28, 29, 30 ou 31 dias
 * e ajustes como Nubank (-1)
 */
export function calcularDiaFechamento(card, ano, mesIndex) {
  if (!card?.fechamento_dia) return null;

  let dia = card.fechamento_dia;

  // Se for 31, usa o último dia real do mês
  if (dia === 31) {
    dia = new Date(ano, mesIndex + 1, 0).getDate();
  }

  // Aplica offset (ex: Nubank = -1)
  const offset = card.fechamento_offset || 0;

  return dia + offset;
}
