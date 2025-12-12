import { useEffect, useState } from "react";
import { getSavingsByYear } from "../services/savings";
import { getSavingsGoal, saveSavingsGoal } from "../services/savingsGoal";
import { money } from "../utils/money";
import { calcularProjecaoEconomiaAnual } from "../calculations/economyProjection";
import "./AnnualSavingsGoal.css";

export default function AnnualSavingsGoal({
  salarios,
  dadosMensais,
  savingsGoal,        // meta do ano atual do dashboard
  setSavingsGoal,
  mes
}) {
  // Ano inicial baseado no filtro do header
  const anoInicial = Number(mes.split("-")[0]);

  // Ano exibido no card (esse muda ao navegar com as setas)
  const [ano, setAno] = useState(anoInicial);

  const [dadosReais, setDadosReais] = useState([]);

  // Meta local
  const [metaAno, setMetaAno] = useState(0);
  const [metaTemp, setMetaTemp] = useState(0);
  const [editandoMeta, setEditandoMeta] = useState(false);

  // =========================================================
  // 🔹 SINCRONIZA O ANO COM O HEADER (CORREÇÃO PRINCIPAL)
  // =========================================================
  useEffect(() => {
    const novoAno = Number(mes.split("-")[0]);
    setAno(novoAno);
  }, [mes]);

  // =========================================================
  // 🔹 Carrega economias registradas para o ano
  // =========================================================
  useEffect(() => {
    async function carregar() {
      const r = await getSavingsByYear(ano);
      setDadosReais(Array.isArray(r) ? r : []);
    }
    carregar();
  }, [ano]);

  // =========================================================
  // 🔹 Carrega META do ano exibido no card (agora correto)
  // =========================================================
  useEffect(() => {
    async function carregarMeta() {

      console.log("🟦 Buscando meta do ano:", ano);
const teste = await getSavingsGoal(ano);
console.log("🟩 Resultado Supabase:", teste);

      // Sempre buscar do banco primeiro
      const metaBD = await getSavingsGoal(ano);
      const valorBanco = metaBD?.valor?.[0] ?? 0;


      // Se for o ano do dashboard, savingsGoal substitui
      const valorFinal =
        ano === anoInicial && savingsGoal != null
          ? savingsGoal
          : valorBanco;

      setMetaAno(valorFinal);
      setMetaTemp(valorFinal);
    }

    carregarMeta();
  }, [ano, savingsGoal, anoInicial]);

  // =========================================================
  // 🔹 Cálculos de projeção
  // =========================================================
  const proj = calcularProjecaoEconomiaAnual({
    ano,
    dadosReais,
    salarios,
    dadosMensais,
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

  // =========================================================
  // 🔹 SALVAR META
  // =========================================================
  async function salvarMeta() {
    const m = Number(metaTemp);
    if (!m || m <= 0) return;

    await saveSavingsGoal(ano, m);

    // Se salvar do ano do dashboard, atualiza global
    if (ano === anoInicial) {
      setSavingsGoal(m);
    }

    setMetaAno(m);
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
              onChange={e => setMetaTemp(e.target.value)}
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


