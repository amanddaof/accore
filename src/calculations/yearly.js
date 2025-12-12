import { isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";
import { calcularReservasProjetadasParaMes } from "./monthly";


// ========================
// 📊 ANUAL POR PESSOA
// ========================
export function calcularGastosAnuaisPorPessoa(
  ano,
  pessoa,
  { transactions = [], bills = [], loans = [], reservas = [] }
) {

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const resultado = [];

  meses.forEach((m, i) => {

    const mesISO = `${ano}-${String(i + 1).padStart(2, "0")}`;
    const mesFmt = isoParaMesAbrev(mesISO);
    let total = 0;

    // 🧾 TRANSAÇÕES
    transactions.forEach(t => {
      if (t.mes !== mesFmt) return;

      const v = safeNumber(t.valor);

      if (pessoa === "Ambos") {
        total += v;
      }
      else if (t.quem === pessoa || t.quem === "Ambos") {
        total += v;
      }
    });

    // 🏡 CONTAS DA CASA
    bills.forEach(b => {
      if (b.mes !== mesFmt) return;

      const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);

      if (pessoa === "Ambos") total += valor;
      else total += valor / 2;
    });

    // 💳 EMPRÉSTIMOS → sempre CELSO
    loans.forEach(l => {
      if (l.mes !== mesFmt) return;

      const valor = safeNumber(l.valor);

      if (pessoa === "Ambos") total += valor;
      else if (pessoa === "Celso") total += valor;
      // Amanda nunca soma empréstimo
    });

    // 🔁 RESERVAS PROJETADAS
    calcularReservasProjetadasParaMes(mesISO, reservas).forEach(r => {
      const valor = safeNumber(r.valor);

      if (pessoa === "Ambos") {
        total += valor;
      }
      else if (r.quem === pessoa || r.quem === "Ambos") {
        total += valor;
      }
    });

    resultado.push({ mes: m, total });
  });

  return resultado;
}


// ========================
// 📈 FILTRADO
// ========================
export function calcularGastosAnuaisFiltrados(ano, pessoa, dados) {
  return calcularGastosAnuaisPorPessoa(ano, pessoa, dados);
}


// ========================
// 🔮 PROJEÇÃO ANUAL
// ========================
export function calcularProjecaoAnual(ano, pessoa, dados) {

  const mensal = calcularGastosAnuaisPorPessoa(ano, pessoa, dados);

  const validos = mensal.filter(m => m.total > 0);

  const totalAtual = validos.reduce((s, m) => s + m.total, 0);
  const jaPassaram = validos.length;

  if (!jaPassaram) return { media: 0, projecao: 0 };

  const media = totalAtual / jaPassaram;
  const projecao = totalAtual + media * (12 - jaPassaram);

  return { media, projecao };
}
