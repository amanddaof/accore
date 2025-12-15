import { useEffect, useState } from "react";
import { getSavingsByYear } from "../services/savings";
import { getSavingsGoal, saveSavingsGoal } from "../services/savingsGoal";
import { money } from "../utils/money";
import { calcularProjecaoEconomiaAnual } from "../calculations/economyProjection";
import "./AnnualSavingsGoal.css";

export default function AnnualSavingsGoal({
  salarios,
  dadosMensais,
  savingsGoal,        // mantém para o pai saber a meta do ano atual, mas não interfere na leitura
  setSavingsGoal,
  mes
}) {
  const anoInicial = Number(mes.split("-")[0]);
  const [ano, setAno] = useState(anoInicial);
  const [dadosReais, setDadosReais] = useState([]);

  const [metaAno, setMetaAno] = useState(0);
  const [metaTemp, setMetaTemp] = useState(0);
  const [editandoMeta, setEditandoMeta] = useState(false);

  // Sincroniza ano com o header
  useEffect(() => {
    const novoAno = Number(mes.split("-")[0]);
    setAno(novoAno);
  }, [mes]);

  // Carrega economias reais
  useEffect(() => {
    async function carregar() {
      const r = await getSavingsByYear(ano);
      setDadosReais(Array.isArray(r) ? r : []);
    }
    carregar();
  }, [ano]);

  // Carrega SEMPRE a meta do banco para o ano exibido
  useEffect(() => {
    async function carregarMeta() {
      const metaBD = await getSavingsGoal(ano);
      const valorBanco = metaBD?.valor ?? 0;

      const valorFinal = valorBanco;

      console.log("DEBUG META", {
        ano,
        anoInicial,
        savingsGoal,
        valorBanco,
        valorFinal
      });

      setMetaAno(valorFinal);
      setMetaTemp(valorFinal);
    }

    carregarMeta();
  }, [ano]);

  const proj = calcularProjecaoEconomiaAnual({
    ano,
    dadosReais,
    salarios,
    dadosMensais
  });

  const {
    somaReais,
    mesesReais,
    mesesFuturos,
    totalProjetadoAno
  } = proj;

  const qtdMesesFuturos = mesesFuturos.length;
  const meta = metaAno;

  const pctReal = meta > 0 ? Math.min(100, (somaReais / meta) * 100) : 0;
  const pctProjetado =
    meta > 0 ? Math.min(100, (totalProjetadoAno / meta) * 100) : 0;

  let tone = "neutral";
  let status = "Defina sua meta anual para começar.";

  if (meta > 0) {
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

  const faltante = Math.max(0, meta - somaReais);
  const guardarPorMes =
    qtdMesesFuturos > 0 ? faltante / qtdMesesFuturos : faltante;

  // SALVAR META
  async function salvarMeta() {
    const m = Number(metaTemp);
    if (!m || m <= 0) return;

    await saveSavingsGoal(ano, m);

    // Atualiza o estado local com o que foi salvo
    setMetaAno(m);
    setEditandoMeta(false);

    // Se for o ano do dashboard, só atualiza o estado global para o pai (não afeta leitura)
    if (ano === anoInicial) {
      setSavingsGoal(m);
    }
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
            {meta > 0 ? `Meta: ${money(meta)}` : "Definir meta"}
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

      {meta > 0 && (
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

      {meta > 0 && (
        <div className="save-plan">
          {faltante <= 0 ? (
            <div className="save-ok">🎉 Meta atingida com meses reais!</div>
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
