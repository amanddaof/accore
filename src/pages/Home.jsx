import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

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
      valor = valor / 2;
    } else if (i.tipo === "Empréstimo") {
      origem = "Empréstimos";
      valor = Number(i.item.valor || 0);
    } else {
      origem = i.item.origem || "Externo";
      valor = Number(i.item.valor || 0);
    }

    if (i.tipo === "Conta da casa") valor = Number(valor) / 2;
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
  const { usuarioLogado } = useOutletContext() || {};

  const amanda = salarios?.amanda || { salario: 0, gasto: 0, sobra: 0 };
  const celso = salarios?.celso || { salario: 0, gasto: 0, sobra: 0 };

  const [amandaMensal, celsoMensal] = mensal?.porPessoa || [];
  const contasAmanda = amandaMensal?.contas || 0;
  const contasCelso = celsoMensal?.contas || 0;
  const totalContasCasa = contasAmanda + contasCelso;

  const [showDebts, setShowDebts] = useState(false);
  const [detalhePessoa, setDetalhePessoa] = useState(null);

  const [pessoaCategorias, setPessoaCategorias] = useState("Ambos");
  const [pessoaEvolucao, setPessoaEvolucao] = useState("Ambos");

  // 🔑 sincroniza categorias
  useEffect(() => {
    if (!usuarioLogado) return;
    setPessoaCategorias(p => (p === "Ambos" ? usuarioLogado : p));
    setPessoaEvolucao(p => (p === "Ambos" ? usuarioLogado : p));
  }, [usuarioLogado]);

  function togglePessoa(nome) {
    setDetalhePessoa(prev => (prev === nome ? null : nome));
  }

  const itensDetalhe =
    detalhePessoa === "Amanda"
      ? agruparPorOrigem(amandaMensal?.itens || [])
      : detalhePessoa === "Celso"
      ? agruparPorOrigem(celsoMensal?.itens || [])
      : [];

  return (
    <div className="home-shell single-column">

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

      <section className="home-card">
        <MonthComparisonCard
          data={comparativoMensal?.total}
          porPessoa={comparativoMensal?.porPessoa}
        />
      </section>

      <section className="home-card">
        <header className="section-title">Evolução anual</header>
        <AnnualEvolutionChart pessoa={pessoaEvolucao} />
      </section>

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
  );
}
