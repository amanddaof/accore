import { useEffect, useState } from "react";
import { getSavingsByYear } from "../services/savings";
import { saveSavingsGoal } from "../services/savingsGoal";
import { money } from "../utils/money";
import { calcularProjecaoEconomiaAnual } from "../calculations/economyProjection";
import "./AnnualSavingsGoal.css";

export default function AnnualSavingsGoal({
  salarios,
  dadosMensais,     // TRANSACTIONS, RESERVAS, BILLS, LOANS
  savingsGoal,       // 👈 META VINDO DO DASHBOARD
  setSavingsGoal,    // 👈 ATUALIZA META
  mes
}) {
  const anoInicial = Number(mes.split("-")[0]);
  const [ano, setAno] = useState(anoInicial);

  const [dadosReais, setDadosReais] = useState([]);

  // Formulário de edição
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaTemp, setMetaTemp] = useState(savingsGoal || 0);

  // Carrega savings reais do ano
  useEffect(() => {
    async function carregar() {
      const r = await getSavingsByYear(ano);
      setDadosReais(Array.isArray(r) ? r : []);
    }
    carregar();
  }, [ano]);

  // Atualiza meta local ao trocar ano
  useEffect(() => {
    if (ano === anoInicial) {
      setMetaTemp(savingsGoal || 0);
    } else {
      setMetaTemp(0);
    }
  }, [ano, savingsGoal, anoInicial]);

  // Projeção
  const proj = calcularProjecaoEconomiaAnual({
    ano,
    dadosReais,
    salarios,
    dadosMensais,
  });

  const {
    somaReais,
    sobraProjetadaTotal,
    totalProjetadoAno,
    mesesReais,
    mesesFuturos
  } = proj;

  const qtdMesesFuturos = mesesFuturos.length;

  // Barras de progresso
  const pctReal =
    savingsGoal > 0 ? Math.min(100, (somaReais / savingsGoal) * 100) : 0;

  const pctProjetado =
    savingsGoal > 0 ? Math.min(100, (totalProjetadoAno / savingsGoal) * 100) : 0;

  // Mensagens
  let tone = "neutral";
  let status = "Defina sua meta anual para começar.";

  if (savingsGoal > 0) {
    if (pctProjetado >= 100) {
      tone = "good";
      status = "🎉 Meta projetada atingida!";
    } else if (pctProjetado >= 80) {
      tone = "good";
      status = "😄 No caminho certo!";
    } else if (pctProjetado >= 60) {
      tone = "warn";
      status = "⚠️ Você está perto, mas pode melhorar.";
    } else {
      tone = "bad";
      status = "🚨 Ritmo insuficiente para bater a meta.";
    }
  }

  // Cálculo de quanto falta por mês
  const faltante = Math.max(0, savingsGoal - somaReais);
  const guardarPorMes =
    qtdMesesFuturos > 0 ? faltante / qtdMesesFuturos : faltante;

  // SALVAR META NO SUPABASE
  async function salvarMeta() {
    const m = Number(metaTemp);
    if (!m || m <= 0) return;

    await saveSavingsGoal(ano, m);   // 👉 SALVA NO BANCO
    setSavingsGoal(m);               // 👉 ATUALIZA IMEDIATAMENTE
    setEditandoMeta(false);
  }

  return (
    <div className="annual-goal-card">

      <header>
        <span>🎯 Economia anual</span>

        <div className="year-select">
          <button onClick={() => setAno(a => a - 1)}>‹</button>
          <span>{ano}</span>
          <button onClick={() => setAno(a => a + 1)}>›</button>
        </div>
      </header>

      {/* META */}
      <div className="edit-row">
        {editandoMeta ? (
          <>
            <input
              type="number"
              value={metaTemp}
              onChange={(e) => setMetaTemp(e.target.value)}
            />
            <button onClick={salvarMeta}>Salvar</button>
          </>
        ) : (
          <button className="meta-btn" onClick={() => setEditandoMeta(true)}>
            {savingsGoal ? `Meta: ${money(savingsGoal)}` : "Definir meta"}
          </button>
        )}
      </div>

      {/* INFORMAÇÕES */}
      <div className="goal-infos">
        <div>
          <span>Meses reais</span>
          <strong>{mesesReais}</strong>
        </div>
        <div>
          <span>Economizado (REAL)</span>
          <strong>{money(somaReais)}</strong>
        </div>
        <div>
          <span>Meses futuros</span>
          <strong>{qtdMesesFuturos}</strong>
        </div>
        <div>
          <span>Projeção FINAL</span>
          <strong>{money(totalProjetadoAno)}</strong>
        </div>
      </div>

      {/* BARRAS DE PROGRESSO */}
      {savingsGoal > 0 && (
        <div className="progress-area multi">
          <div className="bar-bg">
            <div
              className={`bar real ${tone}`}
              style={{ width: `${pctReal}%` }}
            />
            <div
              className={`bar proj ${tone}`}
              style={{ width: `${pctProjetado}%` }}
            />
          </div>

          <div className="numbers">
            <span>Real: {pctReal.toFixed(1)}%</span>
            <em>Proj: {pctProjetado.toFixed(1)}%</em>
          </div>
        </div>
      )}

      {/* PLANO DE AÇÃO */}
      {savingsGoal > 0 && (
        <div className="save-plan">
          {faltante <= 0 ? (
            <div className="save-ok">
              🎉 Meta atingida com meses reais!
            </div>
          ) : qtdMesesFuturos > 0 ? (
            <div className="save-need">
              Faltam {money(faltante)} — guardar{" "}
              <strong>{money(guardarPorMes)}</strong>/mês.
            </div>
          ) : (
            <div className="save-need">
              Faltam {money(faltante)} — e não restam meses futuros.
            </div>
          )}
        </div>
      )}

      <p className={`status ${tone}`}>{status}</p>
    </div>
  );
}
