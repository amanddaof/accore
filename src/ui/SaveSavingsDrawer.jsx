import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import "./SaveSavingsDrawer.css";

const mesesNomes = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

export default function SaveSavingsDrawer({ open, onClose }) {
  if (!open) return null;

  const now = new Date();
  const anoAtual = now.getFullYear();

  // Seletores do formulário
  const [mesSelecionado, setMesSelecionado] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);

  const [showForm, setShowForm] = useState(false);

  // Form inputs
  const [amanda, setAmanda] = useState("");
  const [celso, setCelso] = useState("");
  const [loading, setLoading] = useState(false);

  // Histórico
  const [historico, setHistorico] = useState([]);
  const [expanded, setExpanded] = useState(null);

  // Edição
  const [editando, setEditando] = useState(null);
  const [novoValor, setNovoValor] = useState("");

  // ============================================================
  // Carregar histórico completo do ano
  // ============================================================
  async function carregarHistorico(ano) {
    const { data, error } = await supabase
      .from("savings_yearly")
      .select("*")
      .eq("ano", ano);

    if (error) {
      console.error("Erro carregar:", error);
      return;
    }

    const agrupado = {};

    data.forEach(reg => {
      const mes = String(reg.mes).padStart(2, "0");

      if (!agrupado[mes]) {
        agrupado[mes] = {
          mes,
          numero: Number(mes),
          registros: [],
          amanda: 0,
          celso: 0,
          total: 0
        };
      }

      const valor = Number(reg.economizado_real ?? 0);

      agrupado[mes].registros.push(reg);

      if (reg.pessoa === "amanda") agrupado[mes].amanda += valor;
      if (reg.pessoa === "celso")  agrupado[mes].celso  += valor;

      agrupado[mes].total = agrupado[mes].amanda + agrupado[mes].celso;
    });

    const lista = Object.values(agrupado).sort((a, b) => b.numero - a.numero);
    setHistorico(lista);
  }

  // Carrega histórico anual ao abrir
  useEffect(() => {
    if (open) carregarHistorico(anoSelecionado);
  }, [open, anoSelecionado]);

  // ============================================================
  // Carregar apenas UM mês (rápido)
  // ============================================================
  async function carregarMes(ano, mes) {
    const mesNorm = String(mes).padStart(2, "0");

    const { data, error } = await supabase
      .from("savings_yearly")
      .select("*")
      .eq("ano", ano)
      .eq("mes", mesNorm);

    if (error) {
      console.error("Erro carregar mês:", error);
      return;
    }

    let amanda = 0;
    let celso = 0;

    const registros = (data || []).map(r => {
      const valor = Number(r.economizado_real ?? 0);

      if (r.pessoa === "amanda") amanda += valor;
      if (r.pessoa === "celso")  celso  += valor;

      return {
  id: r.id,
  mes: String(r.mes).padStart(2, "0"),  // <--- ADICIONADO
  pessoa: r.pessoa,
  economizado_real: valor
};

    });

    const total = amanda + celso;

    // Atualiza somente o mês modificado
    setHistorico(prev =>
      prev.map(item =>
        item.mes === mesNorm
          ? {
              ...item,
              amanda,
              celso,
              total,
              registros
            }
          : item
      )
    );
  }

  // ============================================================
  // Insert ou Update (sem duplicações)
  // ============================================================
  async function upsertSaving({ ano, mes, pessoa, valor }) {
    const mesNorm = String(mes).padStart(2, "0");
    const pessoaNorm = pessoa.toLowerCase();

    // Verifica se já existe
    const { data: existing } = await supabase
      .from("savings_yearly")
      .select("id")
      .match({ ano, mes: mesNorm, pessoa: pessoaNorm })
      .maybeSingle();

    if (existing?.id) {
      // UPDATE
      const { error } = await supabase
        .from("savings_yearly")
        .update({ economizado_real: valor })
        .eq("id", existing.id);

      if (error) console.error("Erro update:", error);
      return;
    }

    // INSERT
    const { error } = await supabase
      .from("savings_yearly")
      .insert([
        {
          ano,
          mes: mesNorm,
          pessoa: pessoaNorm,
          economizado_real: valor
        }
      ]);

    if (error) console.error("Erro insert:", error);
  }

  // ============================================================
  // SALVAR NOVOS VALORES
  // ============================================================
  async function salvar() {
    setLoading(true);

    try {
      if (amanda !== "") {
        await upsertSaving({
          ano: anoSelecionado,
          mes: mesSelecionado,
          pessoa: "amanda",
          valor: Number(amanda)
        });
      }

      if (celso !== "") {
        await upsertSaving({
          ano: anoSelecionado,
          mes: mesSelecionado,
          pessoa: "celso",
          valor: Number(celso)
        });
      }

      await carregarMes(anoSelecionado, mesSelecionado);

      setAmanda("");
      setCelso("");
      setShowForm(false);

    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // EXCLUIR REGISTRO POR ID
  // ============================================================
  async function handleDeleteEntry(id) {
    if (!confirm("Excluir este registro?")) return;

    const { error } = await supabase
      .from("savings_yearly")
      .delete()
      .eq("id", id);

    if (error) console.error("Erro delete:", error);

    await carregarMes(anoSelecionado, mesSelecionado);
  }

  // ============================================================
  // EDIÇÃO
  // ============================================================
  function abrirEdicao(reg) {
    setEditando(reg);
    setNovoValor(reg.economizado_real);
  }

  async function salvarEdicao() {
    const { error } = await supabase
      .from("savings_yearly")
      .update({
        economizado_real: Number(novoValor)
      })
      .eq("id", editando.id);

    if (error) console.error("Erro editar:", error);

    await carregarMes(anoSelecionado, editando.mes);

    setEditando(null);
    setNovoValor("");
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="drawer-overlay">
      <aside className="save-savings-drawer">

        <div className="drawer-header">
          <h2>Registrar economia do mês</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="save-savings-content">

          <button
            className="primary-btn"
            onClick={() => setShowForm(s => !s)}
            style={{ marginBottom: 14 }}
          >
            {showForm ? "Fechar formulário" : "+ Registrar economia"}
          </button>

          {/* Formulário */}
          {showForm && (
            <div className="savings-form">

              <div className="savings-form-row">
                <div style={{ flex: 1 }}>
                  <label>Mês</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={Number(mesSelecionado)}
                    onChange={e => {
                      let v = Number(e.target.value);
                      if (v < 1) v = 1;
                      if (v > 12) v = 12;
                      setMesSelecionado(String(v).padStart(2, "0"));
                    }}
                    className="drawer-input"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>Ano</label>
                  <input
                    type="number"
                    value={anoSelecionado}
                    onChange={e => setAnoSelecionado(Number(e.target.value))}
                    className="drawer-input"
                  />
                </div>
              </div>

              <div className="savings-input-row">
                <label>Amanda</label>
                <input
                  type="number"
                  value={amanda}
                  onChange={e => setAmanda(e.target.value)}
                  className="drawer-input"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="savings-input-row">
                <label>Celso</label>
                <input
                  type="number"
                  value={celso}
                  onChange={e => setCelso(e.target.value)}
                  className="drawer-input"
                  placeholder="R$ 0,00"
                />
              </div>

              <button className="primary-btn" onClick={salvar}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}

          {/* ============================= HISTÓRICO ============================= */}
          <div className="savings-list">
            <div className="year-switcher">
  <h3 className="section-title">Economias registradas</h3>

  <div className="year-selector">
    <button onClick={() => setAnoSelecionado(a => a - 1)}>‹</button>
    <span>{anoSelecionado}</span>
    <button onClick={() => setAnoSelecionado(a => a + 1)}>›</button>
  </div>
</div>


            {historico.length === 0 && (
              <p className="empty">Nenhum valor registrado ainda.</p>
            )}

            {historico.map(item => {
              const label = `${mesesNomes[item.numero - 1]}/${String(anoSelecionado).slice(2)}`;

              return (
                <div key={item.mes} className="savings-item">

                  <div
                    className="savings-item-header"
                    onClick={() =>
                      setExpanded(expanded === item.mes ? null : item.mes)
                    }
                  >
                    <span>{label}</span>
                    <strong>R$ {item.total.toFixed(2)}</strong>
                  </div>

                  {expanded === item.mes && (
                    <div className="savings-item-body">

                      {item.registros.map(reg => (
                        <div key={reg.id} className="row">
                          <span>{reg.pessoa}</span>
                          <strong>
                            R$ {Number(reg.economizado_real ?? 0).toFixed(2)}
                          </strong>

                          <div className="actions">
                            <button className="edit-btn" onClick={() => abrirEdicao(reg)}>
                              Editar
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteEntry(reg.id)}>
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Modal de edição */}
        {editando && (
          <div className="edit-modal">
            <div className="edit-box">
              <h3>Editar valor de {editando.pessoa}</h3>

              <input
                type="number"
                className="drawer-input"
                value={novoValor}
                onChange={e => setNovoValor(e.target.value)}
              />

              <button className="primary-btn" onClick={salvarEdicao}>Salvar</button>
              <button className="cancel-btn" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </aside>
    </div>
  );
}
