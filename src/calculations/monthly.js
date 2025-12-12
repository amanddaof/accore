import { MESES, incrementarMes, isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";


// ========================
// 🔁 RESERVAS PROJETADAS
// ========================
export function calcularReservasProjetadasParaMes(mesFiltroISO, reservas = []) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);
  if (!mesFmt) return [];

  const projetadas = [];

  reservas.forEach(res => {

    const valor = safeNumber(res.valor);
    if (!valor || !res.mes) return;

    // parcelado
    if (res.recorrencia === "Parcelado" && res.parcelas?.includes("/")) {

      const [atual, total] = res.parcelas.split("/").map(Number);

      for (let i = atual - 1; i < total; i++) {
        const m = incrementarMes(res.mes, i);
        if (m === mesFmt) {
          projetadas.push({ ...res, tipo: "Reserva projetada", mes: m });
        }
      }
      return;
    }

    // recorrente
    let inc = 1;
    if (res.recorrencia === "Bimestral") inc = 2;
    if (res.recorrencia === "Trimestral") inc = 3;

    for (let i = 0; i < 12; i += inc) {
      const m = incrementarMes(res.mes, i);
      if (m === mesFmt) {
        projetadas.push({ ...res, tipo: "Reserva projetada", mes: m });
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
  { transactions = [], bills = [], loans = [], reservas = [] }
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

  // 🏡 CONTAS DA CASA (50 / 50)
  bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    const metade = valor / 2;

    total.Amanda.contas += metade;
    total.Celso.contas += metade;
  });

  // 💳 EMPRÉSTIMOS (TODOS contam como gasto do Celso)
  loans.forEach(l => {
    if (l.mes !== mesFmt) return;
    const v = safeNumber(l.valor);

    // sempre Celso
    total.Celso.emprestimos += v;
  });

  // 🔁 RESERVAS PROJETADAS
  const proj = calcularReservasProjetadasParaMes(mesFiltroISO, reservas);

  proj.forEach(r => {
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
// 🏦 COFRE
// ========================
export function calcularCofre(sobra) {
  if (!sobra || sobra <= 0) return { mensal: 0, anual: 0 };
  return { mensal: sobra * 0.3, anual: sobra * 12 * 0.3 };
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

  // empréstimos entram NO TOTAL
  dados.loans.forEach(l => {
    if (l.mes === mesFmt) ateHoje += safeNumber(l.valor);
  });

  calcularReservasProjetadasParaMes(mesFiltroISO, dados.reservas)
    .forEach(r => ateHoje += safeNumber(r.valor));

  return {
    totalAteHoje: ateHoje,
    mediaDia: ateHoje / dia,
    projecaoFinal: (ateHoje / dia) * diasMes
  };
}

// 🔮 PROJEÇÃO POR PESSOA (TOTAL FIXO PARA ANO)
export function calcularProjecaoPorPessoaAnual(mesFiltroISO, dados) {
  const mesFmt = isoParaMesAbrev(mesFiltroISO);

  let A = 0;
  let C = 0;

  // transações
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

  // contas da casa
  dados.bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    A += valor / 2;
    C += valor / 2;
  });

  // empréstimos → só Celso
  dados.loans.forEach(l => {
    if (l.mes === mesFmt) {
      C += safeNumber(l.valor);
    }
  });

  // reservas projetadas
  calcularReservasProjetadasParaMes(mesFiltroISO, dados.reservas).forEach(r => {
    const v = safeNumber(r.valor);
    if (r.quem === "Amanda") A += v;
    if (r.quem === "Celso") C += v;
    if (r.quem === "Ambos") {
      A += v;
      C += v;
    }
  });

  // aqui: projeção = total do mês
  return {
    amanda: { total: A, projecao: A },
    celso:  { total: C, projecao: C }
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

  // transações
  dados.transactions.forEach(t => {
    if (t.mes !== mesFmt) return;

    if (t.quem === "Amanda") A += safeNumber(t.valor);
    if (t.quem === "Celso") C += safeNumber(t.valor);
    if (t.quem === "Ambos") {
      A += safeNumber(t.valor);
      C += safeNumber(t.valor);
    }
  });

  // contas da casa
  dados.bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto);
    A += valor / 2;
    C += valor / 2;
  });

  // empréstimos → só Celso
  dados.loans.forEach(l => {
    if (l.mes === mesFmt) {
      C += safeNumber(l.valor);
    }
  });

  // reservas projetadas
  calcularReservasProjetadasParaMes(mesFiltroISO, dados.reservas).forEach(r => {
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
