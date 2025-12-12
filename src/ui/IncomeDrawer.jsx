import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { money } from "../utils/money";
import "./IncomeDrawer.css";

const TOTAL_ESPERADO = 8000;

export default function IncomeDrawer({ open, onClose }) {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [valor, setValor] = useState("");
  const [mes, setMes] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("mes", { ascending: true });

      if (error) console.error("Erro ao buscar recebimentos:", error);

      setRows(data || []);
      setLoading(false);
    }

    load();
  }, [open]);

  const recebido = rows.reduce((s, r) => s + Number(r.valor || 0), 0);
  const falta = TOTAL_ESPERADO - recebido;
  const percentual = TOTAL_ESPERADO
    ? Math.round((recebido / TOTAL_ESPERADO) * 100)
    : 0;

  async function salvar() {
    if (!valor || !mes) {
      alert("Preencha mês e valor");
      return;
    }

    const { error } = await supabase.from("payments").insert([{
      valor: Number(valor),
      mes
    }]);

    if (error) {
      alert("Erro ao salvar recebimento");
      console.error(error);
      return;
    }

    setShowForm(false);
    setValor("");
    setMes("");

    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("mes", { ascending: true });

    setRows(data || []);
  }

  if (!open) return null;

  return (
    <div className="drawer-overlay">
      <aside className="drawer income-drawer">

        <div className="drawer-header">
          <h2>Entradas</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="card-transactions empty">Carregando...</div>
        ) : (
          <>

            {/* 🔹 RESUMO */}
            <div className="income-resume">
              <div>
                <small>Total já recebido</small>
                <strong>{money(recebido)}</strong>
              </div>

              <div>
                <small>Total esperado</small>
                <strong>{money(TOTAL_ESPERADO)}</strong>
              </div>

              <div>
                <small>Falta receber</small>
                <strong style={{ color: falta > 0 ? "#f472b6" : "#4ade80" }}>
                  {money(falta)}
                </strong>
              </div>
            </div>

            {/* 🔹 BARRA */}
            <div className="income-bar">
              <div
                className="income-progress"
                style={{ width: `${percentual}%` }}
              />
            </div>

            <div className="income-percent">
              {percentual}% recebido
            </div>

            {/* 🔹 BOTÃO */}
            <button
              className="primary-btn"
              onClick={() => setShowForm(v => !v)}
            >
              + Novo recebimento
            </button>

            {/* 🔹 FORM */}
            {showForm && (
              <div className="income-form">
                <input
                  type="number"
                  placeholder="Valor recebido"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                />

                <input
                  type="month"
                  value={mes}
                  onChange={e => setMes(e.target.value)}
                />

                <div className="actions">
                  <button className="btn-secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={salvar}>
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {/* 🔹 LISTA */}
            <div className="income-list">
              {rows.map(r => (
                <div key={r.id} className="income-row">
                  <span>{r.mes}</span>
                  <strong>{money(r.valor)}</strong>
                </div>
              ))}
            </div>

          </>
        )}
      </aside>
    </div>
  );
}
