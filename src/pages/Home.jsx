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
import MonthComparisonByPersonCard from "../ui/MonthComparisonByPersonCard";

function agruparPorOrigem(itens = []) {
  const mapa = {};

  itens.forEach(i => {
    let origem;
    let valor;

    if (i.tipo === "Conta da casa") {
      origem = "Conta da casa";
      const real = Number(i.item.valor_real || 0);
      const previsto = Number(i.item.valor_previsto || 0);
      valor = real > 0 ? real : previsto;
      // metade para cada pessoa
      valor = valor / 2;
    } else if (i.tipo === "Empréstimo") {
      origem = "Empréstimos";
      valor = Number(i.item.valor || 0);
    } else {
      origem = i.item.origem || "Externo";
      valor = Number(i.item.valor || 0);
    }

    // 🔑 contas da casa entram pela metade no gasto
    if (i.tipo === "Conta da casa") {
      valor = Number(valor) / 2;
    }

    mapa[origem] = (mapa[origem] || 0) + Number(valor);
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

  const contasAmanda = amandaMensal?.contas || 0;
  const contasCelso = celsoMensal?.contas || 0;
  const totalContasCasa = contasAmanda + contasCelso;

  const [showDebts, setShowDebts] = useState(false);
  // 🔽 novo: quem está com detalhes abertos
  const [detalhePessoa, setDetalhePessoa] = useState(null);
  const [pessoaCategorias, setPessoaCategorias] = useState("Ambos");

  function togglePessoa(nome) {
    setDetalhePessoa(prev => (prev === nome ? null : nome));
  }

  const itensDetalhe =
    detalhePessoa === "Amanda"
      ? agruparPorOrigem(amandaMensal?.itens || [])
      : detalhePessoa === "Celso"
      ? agruparPorOrigem(celsoMensal?.itens || [])
      : [];

  const comparativoTotal = comparativoMensal?.total || null;
  const comparativoPorPessoa = comparativoMensal?.porPessoa || null;

  return (
    <div className="home-shell">
      {/* COLUNA 1 -------------------------------------------------- */}
      <div className="home-column">
        {/* Resumo geral / cards principais */}
        <section className="home-card hero-total">
          <CardsGrid
            mensal={mensal}
            salarios={salarios}
            totalContasCasa={totalContasCasa}
            savingsGoal={savingsGoal}
            setSavingsGoal={setSavingsGoal}
          />
        </section>

        {/* Comparativo mensal total */}
        <section className="home-card">
          <MonthComparisonCard data={comparativoTotal} />
        </section>

        {/* Comparativo mensal por pessoa */}
        <section className="home-card">
          <MonthComparisonByPersonCard
            data={comparativoPorPessoa}
            mesAtualLabel={comparativoTotal?.mesAtual.label}
            mesAnteriorLabel={comparativoTotal?.mesAnterior.label}
          />
        </section>

        {/* Dívidas inline */}
        <section className="home-card">
          <header className="section-title">
            <span>Alertas e dívidas</span>
            <button
              className="link-button"
              type="button"
              onClick={() => setShowDebts(prev => !prev)}
            >
              {showDebts ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          </header>

          <DebtsInline
            dividas={dividas}
            loans={loans}
            open={showDebts}
            onToggle={() => setShowDebts(prev => !prev)}
          />
        </section>
      </div>

      {/* COLUNA 2 -------------------------------------------------- */}
      <div className="home-column">
        {/* Evolução anual */}
        <section className="home-card">
          <header className="section-title">Evolução anual</header>
          <AnnualEvolutionChart mes={mes} categorias={categorias} />
        </section>

        {/* Resumo mensal */}
        <section className="home-card">
          <MonthSummary
            mensal={mensal}
            salarios={salarios}
            totalContasCasa={totalContasCasa}
          />
        </section>

        {/* Meta anual de economia */}
        <section className="home-card">
          <AnnualSavingsGoal mes={mes} savingsGoal={savingsGoal} />
        </section>
      </div>

      {/* COLUNA 3 -------------------------------------------------- */}
      <div className="home-column">
        {/* Resumo por pessoa */}
        <section className="home-card people-summary">
          <header className="section-title">
            <span>Resumo por pessoa</span>
          </header>

          <div className="people-grid">
            {/* Amanda */}
            <div
              className={
                "person-box" +
                (detalhePessoa === "Amanda" ? " person-box-open" : "")
              }
            >
              <button
                type="button"
                className="person-header"
                onClick={() => togglePessoa("Amanda")}
              >
                <span className="person-name">Amanda</span>
                <span className="person-toggle">
                  {detalhePessoa === "Amanda" ? "Esconder" : "Detalhar"}
                </span>
              </button>

              <div className="person-row">
                <span>Salário</span>
                <strong>{money(amanda.salario)}</strong>
              </div>

              <div className="person-row">
                <span>Gastos pessoais</span>
                <strong>{money(amandaMensal?.pessoais || 0)}</strong>
              </div>

              <div className="person-row">
                <span>Contas da casa</span>
                <strong>{money(contasAmanda)}</strong>
              </div>

              <div className="person-row">
                <span>Empréstimos</span>
                <strong>{money(amandaMensal?.emprestimos || 0)}</strong>
              </div>

              <div className="person-row person-result">
                <span>Déficit / sobra</span>
                <strong
                  className={
                    amanda.sobra >= 0 ? "person-result-ok" : "person-result-neg"
                  }
                >
                  {money(amanda.sobra)}
                </strong>
              </div>

              {detalhePessoa === "Amanda" && (
                <div className="person-details">
                  {itensDetalhe.map(i => (
                    <div key={i.origem} className="person-detail-row">
                      <span>{i.origem}</span>
                      <span>{money(i.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Celso */}
            <div
              className={
                "person-box" +
                (detalhePessoa === "Celso" ? " person-box-open" : "")
              }
            >
              <button
                type="button"
                className="person-header"
                onClick={() => togglePessoa("Celso")}
              >
                <span className="person-name">Celso</span>
                <span className="person-toggle">
                  {detalhePessoa === "Celso" ? "Esconder" : "Detalhar"}
                </span>
              </button>

              <div className="person-row">
                <span>Salário</span>
                <strong>{money(celso.salario)}</strong>
              </div>

              <div className="person-row">
                <span>Gastos pessoais</span>
                <strong>{money(celsoMensal?.pessoais || 0)}</strong>
              </div>

              <div className="person-row">
                <span>Contas da casa</span>
                <strong>{money(contasCelso)}</strong>
              </div>

              <div className="person-row">
                <span>Empréstimos</span>
                <strong>{money(celsoMensal?.emprestimos || 0)}</strong>
              </div>

              <div className="person-row person-result">
                <span>Déficit / sobra</span>
                <strong
                  className={
                    celso.sobra >= 0 ? "person-result-ok" : "person-result-neg"
                  }
                >
                  {money(celso.sobra)}
                </strong>
              </div>

              {detalhePessoa === "Celso" && (
                <div className="person-details">
                  {itensDetalhe.map(i => (
                    <div key={i.origem} className="person-detail-row">
                      <span>{i.origem}</span>
                      <span>{money(i.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categorias */}
        <section className="home-card">
          <header className="section-title">
            <span>Gastos por categoria</span>

            <div className="segmented-control">
              <button
                type="button"
                className={pessoaCategorias === "Amanda" ? "active" : ""}
                onClick={() => setPessoaCategorias("Amanda")}
              >
                Amanda
              </button>
              <button
                type="button"
                className={pessoaCategorias === "Celso" ? "active" : ""}
                onClick={() => setPessoaCategorias("Celso")}
              >
                Celso
              </button>
              <button
                type="button"
                className={pessoaCategorias === "Ambos" ? "active" : ""}
                onClick={() => setPessoaCategorias("Ambos")}
              >
                Ambos
              </button>
            </div>
          </header>

          <CategoryPieChart
            mes={mes}
            categorias={categorias}
            pessoa={pessoaCategorias}
          />
        </section>
      </div>
    </div>
  );
}
