import { useEffect, useMemo, useState } from "react";
import { processarReservasPendentes } from "../services/reservations.processor";
import { compararMediaMeses } from "../calculations/monthComparisonAverage";
import { compararPeriodos } from "../calculations/monthComparisonPeriods";

import {
  calcularGastosPorPessoa,
  calcularTotalMensal,
  calcularProjecaoMensal,
  calcularProjecaoPorPessoa
} from "../calculations/monthly";

import { calcularDividasMes } from "../calculations/debts";
import {
  calcularCategoriasMes,
  compararCategoriasMes
} from "../calculations/categories";

import {
  calcularGastosAnuaisPorPessoa,
  calcularProjecaoAnual
} from "../calculations/yearly";

import { getCards } from "../services/cards.service";
import { getLoans } from "../services/loans.service";
import { getBills } from "../services/bills.service";
import { getReservations } from "../services/reservations.service";
import { getSalaryHistory } from "../services/salary.service";
import { getTransactions } from "../services/transactions.service";
import { getSavingsGoal } from "../services/savingsGoal";

/* ======================================================
   Utilitário: mês anterior (YYYY-MM)
====================================================== */
function mesAnteriorISO(mes) {
  if (!mes) return null;

  let [ano, mesNum] = mes.split("-").map(Number);
  mesNum -= 1;

  if (mesNum === 0) {
    mesNum = 12;
    ano -= 1;
  }

  return `${ano}-${String(mesNum).padStart(2, "0")}`;
}

/* ======================================================
   🔑 SALÁRIO VIGENTE NO MÊS (FONTE ÚNICA)
====================================================== */
function salarioNoMes(historico, pessoa, mesISO) {
  if (!historico?.length || !mesISO) return null;

  const [ano, mes] = mesISO.split("-").map(Number);
  const alvo = new Date(ano, mes - 1, 1);

  return historico
    .filter(s => s.quem.toLowerCase() === pessoa)
    .filter(s => new Date(s.data) <= alvo)
    .sort((a, b) => new Date(b.data) - new Date(a.data))[0] || null;
}

export function useDashboard() {
  /* ======================================================
     STATES
  ====================================================== */
  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [bills, setBills] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ======================================================
     MÊS ATUAL (regra do dia 7)
  ====================================================== */
  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    const diaVirada = 7;

    let ano = hoje.getFullYear();
    let mesAtual = hoje.getMonth();

    if (hoje.getDate() >= diaVirada) {
      mesAtual++;
      if (mesAtual > 11) {
        mesAtual = 0;
        ano++;
      }
    }

    return `${ano}-${String(mesAtual + 1).padStart(2, "0")}`;
  });

  /* ======================================================
     LOAD BASE
  ====================================================== */
  async function loadAll() {
    setLoading(true);

    const [
      cardsData,
      loansData,
      billsData,
      reservationsData,
      salaryData,
      transactionsData,
      savingsGoalData
    ] = await Promise.all([
      getCards(),
      getLoans(),
      getBills(),
      getReservations(),
      getSalaryHistory(),
      getTransactions(),
      getSavingsGoal(new Date(mes).getFullYear())
    ]);

    await processarReservasPendentes(cardsData || []);

    setCards(cardsData || []);
    setLoans(loansData || []);
    setBills(billsData || []);
    setReservations(reservationsData || []);
    setSalaryHistory(salaryData || []);
    setTransactions(transactionsData || []);
    setSavingsGoal(savingsGoalData ? savingsGoalData.valor : 0);

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, [mes]);

  /* ======================================================
     BASE DE DADOS
  ====================================================== */
  const dados = useMemo(
    () => ({
      transactions,
      bills,
      loans,
      reservas: reservations,
      cards
    }),
    [transactions, bills, loans, reservations, cards]
  );

  /* ======================================================
     MENSAL ATUAL
  ====================================================== */
  const mensal = useMemo(
    () => ({
      porPessoa: calcularGastosPorPessoa(mes, dados),
      total: calcularTotalMensal(mes, dados),
      projecao: calcularProjecaoMensal(mes, dados),
      porPessoaProjecao: calcularProjecaoPorPessoa(mes, dados)
    }),
    [mes, dados]
  );

  /* ======================================================
     SALÁRIOS (CORRIGIDO E BLINDADO)
  ====================================================== */
  const salarios = useMemo(() => {
    if (!salaryHistory.length) return null;

    const gasto = mensal.porPessoa;

    const amanda = salarioNoMes(salaryHistory, "amanda", mes);
    const celso = salarioNoMes(salaryHistory, "celso", mes);

    return {
      amanda: {
        salario: amanda?.valor || 0,
        gasto: gasto[0]?.total || 0,
        sobra: (amanda?.valor || 0) - (gasto[0]?.total || 0)
      },
      celso: {
        salario: celso?.valor || 0,
        gasto: gasto[1]?.total || 0,
        sobra: (celso?.valor || 0) - (gasto[1]?.total || 0)
      }
    };
  }, [salaryHistory, mensal, mes]);

  /* ======================================================
     EXPORT
  ====================================================== */
  return {
    loading,
    cards,
    loans,
    bills,
    reservations,
    salaryHistory,
    transactions,
    mes,
    setMes,
    mensal,
    salarios,
    savingsGoal,
    setSavingsGoal,
    reload: loadAll
  };
}
