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
import { getSavingsGoal } from "../services/savingsGoal"; // Importando o serviço de meta de economia

// ========================
// 🧠 HOOK CENTRAL
// ========================
export function useDashboard() {

  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [bills, setBills] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState(null); // Estado para armazenar a meta anual

  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    const diaVirada = 7;

    let ano = hoje.getFullYear();
    let mesAtual = hoje.getMonth(); // 0-11

    // se passou do dia 7, avança o mês
    if (hoje.getDate() >= diaVirada) {
      mesAtual += 1;

      if (mesAtual > 11) {
        mesAtual = 0;
        ano += 1;
      }
    }

    return `${ano}-${String(mesAtual + 1).padStart(2, "0")}`;
  });

  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);

    const [
      cardsData,
      loansData,
      billsData,
      reservationsData,
      salaryData,
      transactionsData,
      savingsGoalData // Busca a meta de economia
    ] = await Promise.all([
      getCards(),
      getLoans(),
      getBills(),
      getReservations(),
      getSalaryHistory(),
      getTransactions(),
      getSavingsGoal(new Date(mes).getFullYear()) // Carrega a meta do ano atual
    ]);

    setTransactions(transactionsData);
    setCards(cardsData);
    setLoans(loansData);
    setBills(billsData);
    setReservations(reservationsData);
    setSalaryHistory(salaryData);
    setSavingsGoal(savingsGoalData ? savingsGoalData.valor : 0); // Armazena a meta anual de economia

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
    porPessoaProjecao: calcularProjecaoPorPessoa(mes, dados),
    cofre: null // entrará depois com salários
  }), [mes, dados]);

  const dividas = useMemo(() => calcularDividasMes(mes, dados), [mes, dados]);

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
    if (!salaryHistory || !salaryHistory.length) return null;

    const ano = new Date(mes).getFullYear();

    const registrosAno = salaryHistory.filter(s => new Date(s.data).getFullYear() === ano);

    const ultimoAmanda = [...salaryHistory]
      .filter(s => s.quem.toLowerCase() === "amanda")
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

    const ultimoCelso = [...salaryHistory]
      .filter(s => s.quem.toLowerCase() === "celso")
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

    const salarioAmanda = registrosAno
      .filter(s => s.quem.toLowerCase() === "amanda")
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0]
      || ultimoAmanda;

    const salarioCelso = registrosAno
      .filter(s => s.quem.toLowerCase() === "celso")
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0]
      || ultimoCelso;

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

  const cofre = useMemo(() => {
    if (!salarios) return null;

    return {
      amanda: calcularCofre(salarios.amanda.sobra),
      celso: calcularCofre(salarios.celso.sobra)
    };

  }, [salarios]);

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

  savingsGoal,       // ✔ meta anual
  setSavingsGoal,    // ✔ NECESSÁRIO para atualizar a meta

  reload: loadAll
};

}



