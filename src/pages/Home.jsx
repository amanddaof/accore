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

/* ==========================================================
   FUNÇÃO FINAL - TOTAL REAL + POR PESSOA REAL DOS DADOS MENSAIS
========================================================== */
// Substitua só esta parte na função prepararComparativo:
function prepararComparativo(comparativoMensal) {
  if (!comparativoMensal) return null;

  /** ======= TOTAL ======= **/
  const mesAnterior = {
    label: comparativoMensal.mesAnterior?.label,
    total: Number(comparativoMensal.mesAnterior?.total ?? 0)
  };

  const mesAtual = {
    label: comparativoMensal.mesAtual?.label,
    total: Number(comparativoMensal.mesAtual?.total ?? 0)
  };

  const variacao = {
    valor: mesAtual.total - mesAnterior.total
  };


  /** ======= POR PESSOA ======= **/
  let porPessoa = {};

  if (comparativoMensal.porPessoa) {
    for (const pessoa of ["amanda", "celso"]) {
      const dados = comparativoMensal.porPessoa[pessoa];
      if (!dados) continue;

      // NOVA estrutura real do backend:
      const anterior = Number(dados.anterior?.total ?? dados.anterior ?? 0);
      const atual = Number(dados.atual?.total ?? dados.atual ?? 0);

      porPessoa[pessoa] = {
        anterior: { total: anterior },
        atual: { total: atual },
        valor: atual - anterior
      };
    }
  }

  return { mesAnterior, mesAtual, variacao, porPessoa };
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

  // ✅ PASSA amandaMensal e celsoMensal pra função
  const comparativoFormatado = prepararComparativo(comparativoMensal, mes, amandaMensal, celsoMensal);

  useEffect(() => {
    if (!usuarioLogado) return;

    setPessoaCategorias(prev => {
      if (prev !== "Ambos") return prev;
      if (usuarioLogado === "Amanda") return "Amanda";
      if (usuarioLogado === "Celso") return "Celso";
      return prev;
    });
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

      <section className="home-card people-section">
        <header className="section-title">Resumo por pessoa</header>

        <div className="people-grid">
          <div
            className="person-box amanda"
            onClick={() => togglePessoa("Amanda")}
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

          <div
            className="person-box celso"
            onClick={() => togglePessoa("Celso")}
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
        </div>

        {detalhePessoa && itensDetalhe.length > 0 && (
          <div className="home-card person-details">
            <header className="section-title">
              Detalhamento — {detalhePessoa}
            </header>

            {itensDetalhe.map((i, idx) => (
              <div key={idx} className="person-detail-row">
                <span>{i.origem}</span>
                <strong>{money(i.total)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="home-card comparison-card">
  {comparativoFormatado && (
    <MonthComparisonCard {...comparativoFormatado} />
  )}
</section>

      <section className="home-card">
        <header className="section-title">Evolução anual</header>
        <div className="evolution-chart-wrapper">
          <AnnualEvolutionChart />
        </div>
      </section>

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





