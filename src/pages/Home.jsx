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

  // 🔽 NOVO: toggles dos detalhes
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

            {/* 🔽 LISTA AMANDA */}
            {showAmandaDetails && amandaMensal?.itens?.length > 0 && (
              <div className="home-card">
                {amandaMensal.itens.map((i, idx) => (
                  <div key={idx} className="bill-row">
                    <span>
                      {i.tipo} — {i.item.descricao || i.item.conta || "-"}
                    </span>
                    <strong>{money(i.item.valor)}</strong>
                  </div>
                ))}
              </div>
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

            {/* 🔽 LISTA CELSO */}
            {showCelsoDetails && celsoMensal?.itens?.length > 0 && (
              <div className="home-card">
                {celsoMensal.itens.map((i, idx) => (
                  <div key={idx} className="bill-row">
                    <span>
                      {i.tipo} — {i.item.descricao || i.item.conta || "-"}
                    </span>
                    <strong>{money(i.item.valor)}</strong>
                  </div>
                ))}
              </div>
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
            dadosMensais={{ transactions: [], reservas: [], bills: [], loans }}
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
