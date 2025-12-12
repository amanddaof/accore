import { useEffect, useState } from "react";
import { getSavingsByYear } from "../services/savings";
import { money } from "../utils/money";
import { calcularProjecaoEconomiaAnual } from "../calculations/economyProjection";
import "./AnnualSavingsGoal.css";

export default function AnnualSavingsGoal({
  salarios,
  dadosMensais, // TRANSACTIONS, RESERVAS, BILLS, LOANS
}) {
  const now = new Date();
  const anoAtual = now.getFullYear();

  const [ano, setAno] = useState(anoAtual);
  const [dadosReais, setDadosReais] = useState([]);

  const metaStorageKey = `metaAnual_${ano}`;
  const [metaAnual, setMetaAnual] = useState(
    Number(localStorage.getItem(metaStorageKey)) || 0
  );
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaTemp, setMetaTemp] = useState(metaAnual);

  // Carrega savings reais do ano
  useEffect(() => {
    async function carregar() {
      const r = await getSavingsByYear(ano);
      setDadosReais(Array.isArray(r) ? r : []);

      const meta = Number(localStorage.getItem(metaStorageKey) || 0);
      setMetaAnual(meta);
      setMetaTemp(meta);
    }
    carregar();
  }, [ano]);

  // Projeção real + futura
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
    mesesFuturos, // array de meses futuros
  } = proj;

  const qtdMesesFuturos = mesesFuturos.length;

  // Percentuais para as barras
  const pctReal =
    metaAnual > 0 ? Math.min(100, (somaReais / metaAnual) * 100) : 0;
  const pctProjetado =
    metaAnual > 0 ? Math.min(100, (totalProjetadoAno / metaAnual) * 100) : 0;

  // Mensagem final
  let tone = "neutral";
  let status = "Defina sua meta anual para começar.";

  if (metaAnual > 0) {
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

  // Quanto falta guardar por mês
  // Se quiser considerar a projeção, troque somaReais por totalProjetadoAno
  const faltante = Math.max(0, metaAnual - somaReais);
  const guardarPorMes =
    qtdMesesFuturos > 0 ? faltante / qtdMesesFuturos : faltante;

  function salvarMeta() {
    const m = Number(metaTemp);
    if (!m || m <= 0) return;

    localStorage.setItem(metaStorageKey, m);
    setMetaAnual(m);
    setEditandoMeta(false);
  }

  return (
    <div className="annual-goal-card">
      <header>
        <span>🎯 Economia anual</span>

        <div className="year-select">
          <button onClick={() => setAno((a) => a - 1)}>‹</button>
          <span>{ano}</span>
          <button onClick={() => setAno((a) => a + 1)}>›</button>
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
            {metaAnual ? `Meta: ${money(metaAnual)}` : "Definir meta"}
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

      {metaAnual > 0 && (
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

      {metaAnual > 0 && (
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
