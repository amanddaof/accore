import { isoParaMesAbrev } from "../core/dates";

export function calcularMesFatura({ dataReal, card }) {
  if (!dataReal || !card?.fechamento_dia) return "";

  const compra = new Date(dataReal);
  const fechamentoDia = card.fechamento_dia;
  const offset = card.fechamento_offset || 0;

  // fechamento no mês da compra
  let fechamentoAtual = new Date(
    compra.getFullYear(),
    compra.getMonth(),
    fechamentoDia
  );

  // último dia do mês
  if (fechamentoDia === 31) {
    fechamentoAtual = new Date(
      compra.getFullYear(),
      compra.getMonth() + 1,
      0
    );
  }

  fechamentoAtual.setDate(fechamentoAtual.getDate() + offset);

  // fechamento no mês anterior
  let fechamentoAnterior = new Date(fechamentoAtual);
  fechamentoAnterior.setMonth(fechamentoAnterior.getMonth() - 1);

  // 🔑 escolhe o último fechamento que já aconteceu
  const fechamento =
    fechamentoAtual <= compra ? fechamentoAtual : fechamentoAnterior;

  // 🔑 fatura = mês seguinte ao fechamento
  let ano = fechamento.getFullYear();
  let mes = fechamento.getMonth() + 1;

  if (mes > 11) {
    mes = 0;
    ano += 1;
  }

  const iso = `${ano}-${String(mes + 1).padStart(2, "0")}`;
  return isoParaMesAbrev(iso);
}
