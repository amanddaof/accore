import { useEffect, useMemo, useState } from "react";
import { processarReservasPendentes } from "../services/reservations.processor";

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

    // 🔁 Processa reservas automaticamente
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
     BASE DE DADOS UNIFICADA
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
     MENSAL ANTERIOR
  ====================================================== */
  const mesAnterior = useMemo(
    () => mesAnteriorISO(mes),
    [mes]
  );

  const mensalAnterior = useMemo(() => {
    if (!mesAnterior) return null;

    return {
      total: calcularTotalMensal(mesAnterior, dados),
      porPessoa: calcularGastosPorPessoa(mesAnterior, dados)
    };
  }, [mesAnterior, dados]);

  /* ======================================================
     COMPARATIVO MENSAL
  ====================================================== */
  const comparativoMensal = useMemo(() => {
    if (!mensal || !mensalAnterior) return null;
  
    function montarComparativo(atual = 0, anterior = 0) {
      const valor = atual - anterior;
      return {
        atual,
        anterior,
        valor,
        percentual: anterior === 0 ? 0 : (valor / anterior) * 100
      };
    }
  
    function extrairTotais(lista = []) {
      let amanda = 0;
      let celso = 0;
  
      lista.forEach(p => {
        if (!p) return;
  
        if (p.quem === "Amanda") amanda += p.total || 0;
        if (p.quem === "Celso") celso += p.total || 0;
  
        // REGRA DO PROJETO
        if (p.quem === "Ambos") {
          amanda += p.total || 0;
          celso += p.total || 0;
        }
      });
  
      return { amanda, celso };
    }
  
    const atual = extrairTotais(mensal.porPessoa);
    const anterior = extrairTotais(mensalAnterior.porPessoa);
  
    return {
      mesAtual: mes,
      mesAnterior,
  
      total: montarComparativo(
        mensal.total,
        mensalAnterior.total
      ),
  
      porPessoa: {
        amanda: montarComparativo(atual.amanda, anterior.amanda),
        celso: montarComparativo(atual.celso, anterior.celso)
      }
    };
  }, [mensal, mensalAnterior, mes, mesAnterior]);

  /* ======================================================
     OUTROS CÁLCULOS
  ====================================================== */
  const dividas = useMemo(
    () => calcularDividasMes(mes, dados),
    [mes, dados]
  );

  const categorias = useMemo(
    () => ({
      amanda: calcularCategoriasMes(mes, "Amanda", dados),
      celso: calcularCategoriasMes(mes, "Celso", dados),
      ambos: calcularCategoriasMes(mes, "Ambos", dados),
      comparativo: compararCategoriasMes(mes, "Ambos", dados)
    }),
    [mes, dados]
  );

  const anual = useMemo(
    () => ({
      amanda: calcularGastosAnuaisPorPessoa(
        new Date(mes).getFullYear(),
        "Amanda",
        dados
      ),
      celso: calcularGastosAnuaisPorPessoa(
        new Date(mes).getFullYear(),
        "Celso",
        dados
      ),
      ambos: calcularGastosAnuaisPorPessoa(
        new Date(mes).getFullYear(),
        "Ambos",
        dados
      ),
      projecaoAmanda: calcularProjecaoAnual(
        new Date(mes).getFullYear(),
        "Amanda",
        dados
      ),
      projecaoCelso: calcularProjecaoAnual(
        new Date(mes).getFullYear(),
        "Celso",
        dados
      )
    }),
    [mes, dados]
  );

  const salarios = useMemo(() => {
    if (!salaryHistory.length) return null;

    const ano = new Date(mes).getFullYear();

    const registrosAno = salaryHistory.filter(
      s => new Date(s.data).getFullYear() === ano
    );

    const ultimoAmanda = [...salaryHistory]
      .filter(s => s.quem.toLowerCase() === "amanda")
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

    const ultimoCelso = [...salaryHistory]
      .filter(s => s.quem.toLowerCase() === "celso")
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

    const salarioAmanda =
      registrosAno.find(s => s.quem.toLowerCase() === "amanda") ||
      ultimoAmanda;

    const salarioCelso =
      registrosAno.find(s => s.quem.toLowerCase() === "celso") ||
      ultimoCelso;

    const gasto = mensal.porPessoa;

    return {
      amanda: {
        salario: salarioAmanda?.valor || 0,
        gasto: gasto[0]?.total || 0,
        sobra:
          (salarioAmanda?.valor || 0) - (gasto[0]?.total || 0)
      },
      celso: {
        salario: salarioCelso?.valor || 0,
        gasto: gasto[1]?.total || 0,
        sobra:
          (salarioCelso?.valor || 0) - (gasto[1]?.total || 0)
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
    mensalAnterior,
    comparativoMensal,
    dividas,
    categorias,
    anual,
    salarios,
    savingsGoal,
    setSavingsGoal,
    reload: loadAll
  };
}


