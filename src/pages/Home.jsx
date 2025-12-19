import { useState } from "react";

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

/* ======================================================
   🔧 Agrupa itens do gasto por origem (somente UI)
====================================================== */
function agruparPorOrigem(itens = []) {
  const mapa = {};

  itens.forEach(i => {
    const origem =
      i.tipo === "Conta da casa"
        ? "Conta da casa"
        : i.item.origem || "Externo";

    const valor =
      i.item.valor ??
      i.item.valor_real ??
      i.item.valor_previsto ??
      0;

    if (!mapa[origem]) {
      mapa[origem] = 0;
    }

    mapa[origem] += Number(valor);
  });

  return Object.entries(mapa).map(([origem, total]) => ({
    origem,
    total
  }));
}

export default function Home({
  mensal,
  comparativoMensal,
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

  const [showDebts, setShowDebts] = useState(false);
  const [showAmandaDetails, setShowAmandaDetails] = useState(false);
  const [showCelsoDetails, setShowCelsoDetails] = useState(false);

  const [pessoaCategorias, setPessoaCategorias] = useState("Ambos");

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

            {/* ===================== AMANDA ===================== */}
            <div
              className="person-box amanda"
              onClick={() => setShowAmandaDetails(v => !v)}
              style={{ cursor: "pointer" }}
            >
              <h3>Amanda</h3>

              <div className="person-row">
                <span>Salário</span>
                <strong>{money(amanda.salario)}</strong>
              </div>

              <div className="person-row">
                <span>Gasto</span>
                <strong>{money(amanda.gasto)}</strong>
              </div>

              <div className={`person-result ${amanda.sobra < 0 ? "neg" : "ok"}`}>
                {amanda.sobra < 0 ? "Déficit" : "Sobra"}: {money(amanda.sobra)}
              </div>
            </div>

            {showAmandaDetails && amandaMensal?.itens?.length > 0 && (
              <section className="home-card">
                {agruparPorOrigem(amandaMensal.itens).map((i, idx) => (
                  <div key={idx} className="bill-row">
                    <span>{i.origem}</span>
                    <strong>{money(i.total)}</strong>
                  </div>
                ))}
              </section>
            )}

            {/* ===================== CELSO ===================== */}
            <div
              className="person-box celso"
              onClick={() => setShowCelsoDetails(v => !v)}
              style={{ cursor: "pointer" }}
            >
              <h3>Celso</h3>

              <div className="person-row">
                <span>Salário</span>
                <strong>{money(celso.salario)}</strong>
              </div>

              <div className="person-row">
                <span>Gasto</span>
                <strong>{money(celso.gasto)}</strong>
              </div>

              <div className={`person-result ${celso.sobra < 0 ? "neg" : "ok"}`}>
                {celso.sobra < 0 ? "Déficit" : "Sobra"}: {money(celso.sobra)}
              </div>
            </div>

            {showCelsoDetails && celsoMensal?.itens?.length > 0 && (
              <section className="home-card">
                {agruparPorOrigem(celsoMensal.itens).map((i, idx) => (
                  <div key={idx} className="bill-row">
                    <span>{i.origem}</span>
                    <strong>{money(i.total)}</strong>
                  </div>
                ))}
              </section>
            )}

          </div>
        </section>

        <section className="home-card">
          <MonthComparisonCard data={comparativoMensal} />
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
          <AnnualSavingsGoal
            salarios={salarios}
            dadosMensais={{
              transactions: [],
              reservas: [],
              bills: [],
              loans
            }}
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
