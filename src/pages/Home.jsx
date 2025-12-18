import { useEffect, useState, useMemo } from "react";

import CardsGrid from "../ui/CardsGrid";
import LoansSummary from "../ui/LoansSummary";
import { money } from "../utils/money";
import "./Home.css";
import DebtsInline from "../ui/DebtsInline";
import AnnualEvolutionChart from "../ui/AnnualEvolutionChart";
import CategoryPieChart from "../components/CategoryPieChart";
import MonthSummary from "../components/MonthSummary";
import AnnualSavingsGoal from "../ui/AnnualSavingsGoal";
import MonthComparisonCard from "../ui/MonthComparisonCard";
import { compararMesAtualAnterior } from "../calculations/monthComparison";

import { getTransactions } from "../services/transactions.service";
import { getReservations } from "../services/reservations.service";
import { getBills } from "../services/bills.service";

// ===============================
// util simples para mês anterior
// ===============================
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

export default function Home({
  mensal,
  dividas,
  salarios,
  loans,
  mes,
  categorias,
  savingsGoal,
  setSavingsGoal
}) {
  const amanda = salarios?.amanda || { salario: 0, gasto: 0, sobra: 0 };
  const celso = salarios?.celso || { salario: 0, gasto: 0, sobra: 0 };

  const [amandaMensal, celsoMensal] = mensal?.porPessoa || [];
  const contasAmanda = amandaMensal?.contas || 0;
  const contasCelso = celsoMensal?.contas || 0;
  const totalContasCasa = contasAmanda + contasCelso;

  const [showDebts, setShowDebts] = useState(false);
  const [pessoaCategorias, setPessoaCategorias] = useState("Ambos");

  // ===============================
  // dados globais (meta anual)
  // ===============================
  const [transactions, setTransactions] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    async function carregarTudo() {
      const t = await getTransactions();
      const r = await getReservations();
      const b = await getBills();

      setTransactions(t || []);
      setReservas(r || []);
      setBills(b || []);
    }
    carregarTudo();
  }, []);

  const dadosMensais = {
    transactions,
    reservas,
    bills,
    loans
  };

  // ===============================
  // 🔴 MÊS ANTERIOR (AQUI É O PONTO-CHAVE)
  // ===============================
  const [mensalAnterior, setMensalAnterior] = useState(null);

  useEffect(() => {
    if (!mes) return;

    async function carregarMesAnterior() {
      const mesAnterior = mesAnteriorISO(mes);

      if (!mesAnterior) return;

      // ⚠️ TODO IMPORTANTE:
      // Use A MESMA função que já monta o `mensal` atual
      // Exemplo (ajuste para o nome real do seu projeto):
      //
      // const anterior = await getMonthlyData(mesAnterior);
      //
      // setMensalAnterior(anterior);

      setMensalAnterior(null); // placeholder até plugar a função real
    }

    carregarMesAnterior();
  }, [mes]);

  // ===============================
  // comparativo mensal (correto)
  // ===============================
  const comparativo = useMemo(() => {
    return compararMesAtualAnterior({
      mes,
      totalAtual: mensal?.total || 0,
      totalAnterior: mensalAnterior?.total || 0
    });
  }, [mes, mensal, mensalAnterior]);

  return (
    <div className="home-shell two-columns">

      {/* ===================== COLUNA ESQUERDA ===================== */}
      <div className="home-column left">

        <section className="home-card hero-total">
          <CardsGrid
            mensal={mensal}
            dividas={dividas}
            onToggleDebts={() => setShowDebts(v => !v)}
          />
        </section>

        {showDebts && (
          <section className="home-card">
            <DebtsInline dividas={dividas} />
          </section>
        )}

        <section className="home-card people-section">
          <header className="section-title">Resumo por pessoa</header>

          <div className="people-grid">
            <div className="person-box amanda">
              <h3>Amanda</h3>

              <div className="person-row">
                <span>Salário</span>
                <strong>R$ {amanda.salario.toFixed(2)}</strong>
              </div>

              <div className="person-row">
                <span>Gasto</span>
                <strong>R$ {amanda.gasto.toFixed(2)}</strong>
              </div>

              <div className={`person-result ${amanda.sobra < 0 ? "neg" : "ok"}`}>
                {amanda.sobra < 0 ? "Déficit" : "Sobra"}: R$ {amanda.sobra.toFixed(2)}
              </div>
            </div>

            <div className="person-box celso">
              <h3>Celso</h3>

              <div className="person-row">
                <span>Salário</span>
                <strong>R$ {celso.salario.toFixed(2)}</strong>
              </div>

              <div className="person-row">
                <span>Gasto</span>
                <strong>R$ {celso.gasto.toFixed(2)}</strong>
              </div>

              <div className={`person-result ${celso.sobra < 0 ? "neg" : "ok"}`}>
                {celso.sobra < 0 ? "Déficit" : "Sobra"}: R$ {celso.sobra.toFixed(2)}
              </div>
            </div>
          </div>
        </section>

        <section className="home-card">
          <MonthComparisonCard data={comparativo} />
        </section>

        <section className="home-card">
          <header className="section-title">Evolução anual</header>
          <div className="evolution-chart-wrapper">
            <AnnualEvolutionChart />
          </div>
        </section>

      </div>

      {/* ===================== COLUNA DIREITA ===================== */}
      <div className="home-column right">

        <section className="home-card">
          <header className="section-title">Contas da casa</header>

          <div className="house-bills">
            <div className="bill-row">
              <span>Amanda</span>
              <strong>{money(contasAmanda)}</strong>
            </div>

            <div className="bill-row">
              <span>Celso</span>
              <strong>{money(contasCelso)}</strong>
            </div>

            <div className="bill-row total">
              <span>Total do mês</span>
              <strong>{money(totalContasCasa)}</strong>
            </div>
          </div>
        </section>

        <section className="home-card">
          <AnnualSavingsGoal
            salarios={salarios}
            dadosMensais={dadosMensais}
            savingsGoal={savingsGoal}
            setSavingsGoal={setSavingsGoal}
            mes={mes}
          />
        </section>

        <section className="home-card">
          <LoansSummary loans={loans} mes={mes} />
        </section>

        <section className="home-card">
          <header className="section-title category-header">
            Gastos por categoria
            <div className="category-tabs">
              {["Amanda", "Celso", "Ambos"].map(p => (
                <button
                  key={p}
                  className={pessoaCategorias === p ? "active" : ""}
                  onClick={() => setPessoaCategorias(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </header>

          <CategoryPieChart
            data={categorias?.[pessoaCategorias.toLowerCase()] || []}
          />

          <MonthSummary categorias={categorias} pessoa={pessoaCategorias} />
        </section>

      </div>
    </div>
  );
}
