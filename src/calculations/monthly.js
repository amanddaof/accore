import { MESES, incrementarMes, isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";
import { calcularMesFatura } from "../calculations/cardInvoice";

// ========================
// 🔁 RESERVAS PROJETADAS
// ========================
export function calcularReservasProjetadasParaMes(
  mesFiltroISO,
  reservas = [],
  cards = [],
  transactions = []
) {
  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  if (!mesFmt) return [];

  const projetadas = [];

  reservas.forEach(res => {
    const valor = safeNumber(res.valor);
    if (!valor || !res.data_real) return;

    // ❌ não projetar se já virou transação no mês
    const jaProcessada = transactions.some(t =>
      t.mes === mesFmt &&
      t.descricao === res.descricao &&
      t.origem === res.origem
    );
    if (jaProcessada) return;

    // 🔑 cartão (ou null se externo)
    const card = cards.find(c => c.nome === res.origem) || null;

    // 🔑 mês base da reserva (fonte da verdade)
const mesBase = res.mes;
if (!mesBase) return;


    // ========================
    // 📦 PARCELADO
    // ========================
    if (res.recorrencia === "Parcelado" && res.parcelas?.includes("/")) {
      const [atual, total] = res.parcelas.split("/").map(Number);

      for (let i = atual - 1; i < total; i++) {
        const m = incrementarMes(mesBase, i);
        if (m === mesFmt) {
          projetadas.push({ ...res, tipo: "Reserva projetada", mes: m });
        }
      }
      return;
    }

    // ========================
    // 🔁 RECORRENTE (CORRIGIDO)
    // ========================
    const inc =
      res.recorrencia === "Bimestral" ? 2 :
      res.recorrencia === "Trimestral" ? 3 :
      1;

    const [mBase, aBase] = mesBase.split("/");
    const [mAlvo, aAlvo] = mesFmt.split("/");

    const base = new Date(2000 + Number(aBase), MESES.indexOf(mBase));
    const alvo = new Date(2000 + Number(aAlvo), MESES.indexOf(mAlvo));

    const diff =
      (alvo.getFullYear() - base.getFullYear()) * 12 +
      (alvo.getMonth() - base.getMonth());

    if (diff >= 0 && diff % inc === 0) {
      projetadas.push({
        ...res,
        tipo: "Reserva projetada",
        mes: mesFmt
      });
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

  const itens = { Amanda: [], Celso: [] };

  transactions.forEach(t => {
    if (t.mes !== mesFmt) return;
    const v = safeNumber(t.valor);

    if (t.quem === "Amanda") {
      total.Amanda.pessoais += v;
      itens.Amanda.push({ tipo: "Transação", item: t });
    } else if (t.quem === "Celso") {
      total.Celso.pessoais += v;
      itens.Celso.push({ tipo: "Transação", item: t });
    } else if (t.quem === "Ambos") {
      total.Amanda.pessoais += v;
      total.Celso.pessoais += v;
      itens.Amanda.push({ tipo: "Transação", item: t });
      itens.Celso.push({ tipo: "Transação", item: t });
    }
  });

  bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    const metade = valor / 2;

    total.Amanda.contas += metade;
    total.Celso.contas += metade;
  });

  loans.forEach(l => {
    if (l.mes !== mesFmt) return;
    total.Celso.emprestimos += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    reservas,
    cards,
    transactions
  ).forEach(r => {
    const v = safeNumber(r.valor);

    if (r.quem === "Amanda") total.Amanda.pessoais += v;
    if (r.quem === "Celso") total.Celso.pessoais += v;
    if (r.quem === "Ambos") {
      total.Amanda.pessoais += v;
      total.Celso.pessoais += v;
    }
  });

  const pessoa = nome => ({
    nome,
    ...total[nome],
    total:
      total[nome].pessoais +
      total[nome].contas +
      total[nome].emprestimos,
    itens: itens[nome]
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
// 🔮 PROJEÇÃO MENSAL
// ========================
export function calcularProjecaoMensal(mesFiltroISO, dados) {
  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  const hoje = new Date();
  const dia = hoje.getDate();
  const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

  let total = 0;

  dados.transactions.forEach(t => {
    if (t.mes === mesFmt) total += safeNumber(t.valor);
  });

  dados.bills.forEach(b => {
    if (b.mes === mesFmt) {
      total += safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    }
  });

  dados.loans.forEach(l => {
    if (l.mes === mesFmt) total += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    dados.reservas,
    dados.cards,
    dados.transactions
  ).forEach(r => {
    total += safeNumber(r.valor);
  });

  return {
    totalAteHoje: total,
    mediaDia: total / dia,
    projecaoFinal: (total / dia) * diasMes
  };
}

// ========================
// 🔮 PROJEÇÃO POR PESSOA (ANUAL)
// ========================
export function calcularProjecaoPorPessoaAnual(mesFiltroISO, dados) {
  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  let A = 0, C = 0;

  dados.transactions.forEach(t => {
    if (t.mes !== mesFmt) return;
    const v = safeNumber(t.valor);
    if (t.quem === "Amanda") A += v;
    if (t.quem === "Celso") C += v;
    if (t.quem === "Ambos") { A += v; C += v; }
  });

  dados.bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const v = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    A += v / 2; C += v / 2;
  });

  dados.loans.forEach(l => {
    if (l.mes === mesFmt) C += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    dados.reservas,
    dados.cards,
    dados.transactions
  ).forEach(r => {
    const v = safeNumber(r.valor);
    if (r.quem === "Amanda") A += v;
    if (r.quem === "Celso") C += v;
    if (r.quem === "Ambos") { A += v; C += v; }
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

  let A = 0, C = 0;

  dados.transactions.forEach(t => {
    if (t.mes !== mesFmt) return;
    const v = safeNumber(t.valor);
    if (t.quem === "Amanda") A += v;
    if (t.quem === "Celso") C += v;
    if (t.quem === "Ambos") { A += v; C += v; }
  });

  dados.bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const v = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    A += v / 2; C += v / 2;
  });

  dados.loans.forEach(l => {
    if (l.mes === mesFmt) C += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(
    mesFiltroISO,
    dados.reservas,
    dados.cards,
    dados.transactions
  ).forEach(r => {
    const v = safeNumber(r.valor);
    if (r.quem === "Amanda") A += v;
    if (r.quem === "Celso") C += v;
    if (r.quem === "Ambos") { A += v; C += v; }
  });

  return {
    amanda: { total: A, media: A / dia, projecao: (A / dia) * diasMes },
    celso: { total: C, media: C / dia, projecao: (C / dia) * diasMes }
  };
}

