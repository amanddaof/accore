import { MESES, incrementarMes, isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";
import { calcularMesFatura } from "../calculations/cardInvoice";


// ========================
// 🔁 RESERVAS PROJETADAS
// ========================
export function calcularReservasProjetadasParaMes(
  mesFiltroISO,
  reservas = [],
  cards = []
) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  if (!mesFmt) return [];

  const projetadas = [];

  reservas.forEach(res => {

    const valor = safeNumber(res.valor);
    if (!valor || !res.data_real) return;

    // 🔑 resolver cartão (ou null se externo)
    const card = cards.find(c => c.nome === res.origem) || null;

    // 🔑 mês base = mês da FATURA
    const mesBase = calcularMesFatura({
      dataReal: res.data_real,
      card
    });

    if (!mesBase) return;

    // ========================
    // 📦 PARCELADO
    // ========================
    if (res.recorrencia === "Parcelado" && res.parcelas?.includes("/")) {

      const [atual, total] = res.parcelas.split("/").map(Number);

      for (let i = atual - 1; i < total; i++) {
        const m = incrementarMes(mesBase, i);
        if (m === mesFmt) {
          projetadas.push({
            ...res,
            tipo: "Reserva projetada",
            mes: m
          });
        }
      }
      return;
    }

    // ========================
    // 🔁 RECORRENTE
    // ========================
    let inc = 1;
    if (res.recorrencia === "Bimestral") inc = 2;
    if (res.recorrencia === "Trimestral") inc = 3;

    for (let i = 0; i < 12; i += inc) {
      const m = incrementarMes(mesBase, i);
      if (m === mesFmt) {
        projetadas.push({
          ...res,
          tipo: "Reserva projetada",
          mes: m
        });
      }
    }

  });

  return projetadas;
}


// ========================
// 🧮 GASTOS POR PESSOA
// ========================
export function calcularGastosPorPessoa(
  mesFiltroISO,
  { transactions = [], bills = [], loans = [], reservas = [], cards = [] }
) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);

  const total = {
    Amanda: { pessoais: 0, contas: 0, emprestimos: 0 },
    Celso: { pessoais: 0, contas: 0, emprestimos: 0 }
  };

  // 🧾 TRANSAÇÕES
  transactions.forEach(t => {
    if (t.mes !== mesFmt) return;
    const v = safeNumber(t.valor);

    if (t.quem === "Amanda") total.Amanda.pessoais += v;
    else if (t.quem === "Celso") total.Celso.pessoais += v;
    else if (t.quem === "Ambos") {
      total.Amanda.pessoais += v;
      total.Celso.pessoais += v;
    }
  });

  // 🏡 CONTAS DA CASA
  bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    const metade = valor / 2;

    total.Amanda.contas += metade;
    total.Celso.contas += metade;
  });

  // 💳 EMPRÉSTIMOS
  loans.forEach(l => {
    if (l.mes !== mesFmt) return;
    total.Celso.emprestimos += safeNumber(l.valor);
  });

  // 🔁 RESERVAS PROJETADAS
  calcularReservasProjetadasParaMes(mesFiltroISO, reservas, cards)
    .forEach(r => {
      const v = safeNumber(r.valor);

      if (r.quem === "Amanda") total.Amanda.pessoais += v;
      else if (r.quem === "Celso") total.Celso.pessoais += v;
      else if (r.quem === "Ambos") {
        total.Amanda.pessoais += v;
        total.Celso.pessoais += v;
      }
    });

  const pessoa = nome => ({
    nome,
    ...total[nome],
    total: total[nome].pessoais + total[nome].contas + total[nome].emprestimos
  });

  return [pessoa("Amanda"), pessoa("Celso")];
}


// ========================
// 💰 TOTAL MENSAL
// ========================
export function calcularTotalMensal(mesFiltroISO, dados) {
  const porPessoa = calcularGastosPorPessoa(mesFiltroISO, dados);
  return porPessoa[0].total + porPessoa[1].total;
}


// ========================
// 🔮 PROJEÇÃO MENSAL (TOTAL)
// ========================
export function calcularProjecaoMensal(mesFiltroISO, dados) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  const hoje = new Date();
  const dia = hoje.getDate();
  const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

  let ateHoje = 0;

  dados.transactions.forEach(t => {
    if (t.mes === mesFmt) ateHoje += safeNumber(t.valor);
  });

  dados.bills.forEach(b => {
    if (b.mes === mesFmt) {
      ateHoje += safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    }
  });

  dados.loans.forEach(l => {
    if (l.mes === mesFmt) ateHoje += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    dados.reservas,
    dados.cards
  ).forEach(r => {
    ateHoje += safeNumber(r.valor);
  });

  return {
    totalAteHoje: ateHoje,
    mediaDia: ateHoje / dia,
    projecaoFinal: (ateHoje / dia) * diasMes
  };
}


// ========================
// 🔮 PROJEÇÃO POR PESSOA (ANUAL)
// ========================
export function calcularProjecaoPorPessoaAnual(mesFiltroISO, dados) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);

  let A = 0;
  let C = 0;

  dados.transactions.forEach(t => {
    if (t.mes !== mesFmt) return;
    const v = safeNumber(t.valor);

    if (t.quem === "Amanda") A += v;
    if (t.quem === "Celso") C += v;
    if (t.quem === "Ambos") {
      A += v;
      C += v;
    }
  });

  dados.bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    A += valor / 2;
    C += valor / 2;
  });

  dados.loans.forEach(l => {
    if (l.mes === mesFmt) C += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    dados.reservas,
    dados.cards
  ).forEach(r => {
    const v = safeNumber(r.valor);

    if (r.quem === "Amanda") A += v;
    if (r.quem === "Celso") C += v;
    if (r.quem === "Ambos") {
      A += v;
      C += v;
    }
  });

  return {
    amanda: { total: A, projecao: A },
    celso: { total: C, projecao: C }
  };
}


// ========================
// 👥 PROJEÇÃO POR PESSOA
// ========================
export function calcularProjecaoPorPessoa(mesFiltroISO, dados) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  const hoje = new Date();
  const dia = hoje.getDate();
  const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

  let A = 0;
  let C = 0;

  dados.transactions.forEach(t => {
    if (t.mes !== mesFmt) return;

    if (t.quem === "Amanda") A += safeNumber(t.valor);
    if (t.quem === "Celso") C += safeNumber(t.valor);
    if (t.quem === "Ambos") {
      A += safeNumber(t.valor);
      C += safeNumber(t.valor);
    }
  });

  dados.bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    A += valor / 2;
    C += valor / 2;
  });

  dados.loans.forEach(l => {
    if (l.mes === mesFmt) C += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    dados.reservas,
    dados.cards
  ).forEach(r => {
    const v = safeNumber(r.valor);

    if (r.quem === "Amanda") A += v;
    if (r.quem === "Celso") C += v;
    if (r.quem === "Ambos") {
      A += v;
      C += v;
    }
  });

  return {
    amanda: { total: A, media: A / dia, projecao: (A / dia) * diasMes },
    celso: { total: C, media: C / dia, projecao: (C / dia) * diasMes }
  };
}
