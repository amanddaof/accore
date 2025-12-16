import { useEffect, useMemo, useState } from "react";

import {
  calcularGastosPorPessoa,
  calcularTotalMensal,
  calcularProjecaoMensal,
  calcularProjecaoPorPessoa
} from "../calculations/monthly";

import { calcularDividasMes } from "../calculations/debts";
import { calcularCategoriasMes, compararCategoriasMes } from "../calculations/categories";
import { calcularGastosAnuaisPorPessoa, calcularProjecaoAnual } from "../calculations/yearly";

import { getCards } from "../services/cards.service";
import { getLoans } from "../services/loans.service";
import { getBills } from "../services/bills.service";
import { getReservations } from "../services/reservations.service";
import { getSalaryHistory } from "../services/salary.service";
import { getTransactions } from "../services/transactions.service";
import { getSavingsGoal } from "../services/savingsGoal";

export function useDashboard() {
  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [bills, setBills] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const dados = useMemo(() => ({
    transactions,
    bills,
    loans,
    reservas: reservations,
    cards
  }), [transactions, bills, loans, reservations, cards]);

  const mensal = useMemo(() => ({
    porPessoa: calcularGastosPorPessoa(mes, dados),
    total: calcularTotalMensal(mes, dados),
    projecao: calcularProjecaoMensal(mes, dados),
    porPessoaProjecao: calcularProjecaoPorPessoa(mes, dados)
  }), [mes, dados]);

  const dividas = useMemo(
    () => calcularDividasMes(mes, dados),
    [mes, dados]
  );

  const categorias = useMemo(() => ({
    amanda: calcularCategoriasMes(mes, "Amanda", dados),
    celso: calcularCategoriasMes(mes, "Celso", dados),
    ambos: calcularCategoriasMes(mes, "Ambos", dados),
    comparativo: compararCategoriasMes(mes, "Ambos", dados)
  }), [mes, dados]);

  const anual = useMemo(() => ({
    amanda: calcularGastosAnuaisPorPessoa(new Date(mes).getFullYear(), "Amanda", dados),
    celso: calcularGastosAnuaisPorPessoa(new Date(mes).getFullYear(), "Celso", dados),
    ambos: calcularGastosAnuaisPorPessoa(new Date(mes).getFullYear(), "Ambos", dados),
    projecaoAmanda: calcularProjecaoAnual(new Date(mes).getFullYear(), "Amanda", dados),
    projecaoCelso: calcularProjecaoAnual(new Date(mes).getFullYear(), "Celso", dados)
  }), [mes, dados]);

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
      registrosAno.filter(s => s.quem.toLowerCase() === "amanda")[0] || ultimoAmanda;

    const salarioCelso =
      registrosAno.filter(s => s.quem.toLowerCase() === "celso")[0] || ultimoCelso;

    const gasto = mensal.porPessoa;

    return {
      amanda: {
        salario: salarioAmanda?.valor || 0,
        gasto: gasto[0]?.total || 0,
        sobra: (salarioAmanda?.valor || 0) - (gasto[0]?.total || 0)
      },
      celso: {
        salario: salarioCelso?.valor || 0,
        gasto: gasto[1]?.total || 0,
        sobra: (salarioCelso?.valor || 0) - (gasto[1]?.total || 0)
      }
    };
  }, [salaryHistory, mensal, mes]);

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
    dividas,
    categorias,
    anual,
    salarios,
    savingsGoal,
    setSavingsGoal,
    reload: loadAll
  };
}
