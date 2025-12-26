import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { getBills } from "../services/bills.service";
import { supabase } from "../services/supabase";
import {
  isoParaMesAbrev,
  mesAbrevParaISO,
  incrementarMes
} from "../core/dates";
import { money } from "../utils/money";

export default function BillsDrawer({ open, onClose, mes }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtro de mês interno
  const [mesFiltro, setMesFiltro] = useState(mes);

  // 🔥 controle de expansão
  const [expandedBillId, setExpandedBillId] = useState(null);

  useEffect(() => {
    setMesFiltro(mes);
  }, [mes]);

  // toggler do formulário
  const [showForm, setShowForm] = useState(false);

  // formulário
  const [form, setForm] = useState({
    conta: "",
    valor_previsto: "",
    valor_real: "",
    mes: "",
    status: "Pendente",
  });

  // carregar contas
  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      try {
        const data = await getBills();
        setBills(data || []);
      } catch (err) {
        console.error("Erro ao carregar contas da casa:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open]);

  const mesFmt = isoParaMesAbrev(mesFiltro);

  const lista = bills
    .filter(b => !mesFmt || b.mes === mesFmt)
    .sort((a, b) => {
      const pagoA = (a.status || "").toLowerCase() === "pago";
      const pagoB = (b.status || "").toLowerCase() === "pago";
      if (pagoA !== pagoB) return pagoA ? 1 : -1;
      return (a.conta || "").localeCompare(b.conta || "");
    });

  function toggleForm() {
    setShowForm(v => {
      const novo = !v;
      if (novo) {
        setForm({
          conta: "",
          valor_previsto: "",
          valor_real: "",
          mes: mesFmt || "",
          status: "Pendente",
        });
      }
      return novo;
    });
  }

  async function salvarConta(e) {
    e.preventDefault();

    const payload = {
      conta: form.conta,
      valor_previsto: Number(form.valor_previsto),
      valor_real: form.valor_real ? Number(form.valor_real) : null,
      mes: form.mes,
      status: form.status,
    };

    const { data, error } = await supabase
      .from("bills")
      .insert([payload])
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar conta");
      console.error(error);
      return;
    }

    setBills(prev => [data, ...prev]);
    setShowForm(false);
  }

  async function marcarComoPago(bill) {
    const valor =
      bill.valor_real != null && bill.valor_real !== 0
        ? bill.valor_real
        : bill.valor_previsto ?? 0;

    const { error } = await supabase
      .from("bills")
      .update({
        valor_real: valor,
        status: "Pago",
      })
      .eq("id", bill.id);

    if (error) {
      alert("Erro ao marcar como pago");
      console.error(error);
      return;
    }

    setBills(prev =>
      prev.map(b =>
        b.id === bill.id
          ? { ...b, valor_real: valor, status: "Pago" }
          : b
      )
    );
  }

  function mesAnterior() {
    const atual = isoParaMesAbrev(mesFiltro);
    setMesFiltro(mesAbrevParaISO(incrementarMes(atual, -1)));
  }

  function mesProximo() {
    const atual = isoParaMesAbrev(mesFiltro);
    setMesFiltro(mesAbrevParaISO(incrementarMes(atual, 1)));
  }

  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
    <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Contas da casa</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">
          <div className="drawer-filter">
            <button onClick={mesAnterior}>◀</button>
            <strong>{mesFmt || "-"}</strong>
            <button onClick={mesProximo}>▶</button>
          </div>

          <button className="primary-btn" onClick={toggleForm}>
            {showForm ? "Fechar" : "+ Nova conta"}
          </button>

          {showForm && (
            <form className="purchase-form" onSubmit={salvarConta}>
              <input
                placeholder="Nome da conta"
                value={form.conta}
                onChange={e =>
                  setForm({ ...form, conta: e.target.value })
                }
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Valor previsto"
                value={form.valor_previsto}
                onChange={e =>
                  setForm({
                    ...form,
                    valor_previsto: e.target.value
                  })
                }
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Valor real (opcional)"
                value={form.valor_real}
                onChange={e =>
                  setForm({
                    ...form,
                    valor_real: e.target.value
                  })
                }
              />

              <input
                placeholder="Mês (ex: Dez/25)"
                value={form.mes}
                onChange={e =>
                  setForm({ ...form, mes: e.target.value })
                }
                required
              />

              <select
                value={form.status}
                onChange={e =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option>Pendente</option>
                <option>Pago</option>
              </select>

              <button className="primary-btn" type="submit">
                Salvar conta
              </button>
            </form>
          )}

          {loading ? (
            <div className="card-transactions empty">
              Carregando contas da casa...
            </div>
          ) : lista.length === 0 ? (
            <div className="card-transactions empty">
              Nenhuma conta da casa para este mês.
            </div>
          ) : (
            <div className="card-transactions">
              {lista.map(bill => (
                <BillRow
                  key={bill.id}
                  bill={bill}
                  expanded={expandedBillId === bill.id}
                  onToggle={() =>
                    setExpandedBillId(prev =>
                      prev === bill.id ? null : bill.id
                    )
                  }
                  onMarkPaid={marcarComoPago}
                  onUpdate={updated =>
                    setBills(prev =>
                      prev.map(b =>
                        b.id === updated.id ? updated : b
                      )
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function BillRow({
  bill,
  expanded,
  onToggle,
  onMarkPaid,
  onUpdate
}) {
  const pago = (bill.status || "").toLowerCase() === "pago";
  const [valorReal, setValorReal] = useState(
    bill.valor_real ?? ""
  );

  async function salvarValorReal(e) {
    e.stopPropagation();

    const valor = Number(valorReal);

    const { data, error } = await supabase
      .from("bills")
      .update({ valor_real: valor })
      .eq("id", bill.id)
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar valor real");
      console.error(error);
      return;
    }

    onUpdate(data);
  }

  const valorMostrar =
    Number(bill.valor_real || 0) ||
    Number(bill.valor_previsto || 0);

  return (
    <div className="history-row" onClick={onToggle}>
      <div className="history-desc">
        <span className="title">{bill.conta}</span>
        <span className="sub">
          {bill.mes} • {pago ? "Pago" : "Pendente"}
        </span>
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6
  }}
>
  <strong className="amount">
    {money(valorMostrar)}
  </strong>

  {!pago && (
    <button
      className="mark-paid-btn"
      onClick={e => {
        e.stopPropagation();
        onMarkPaid(bill);
      }}
    >
      Marcar como pago ✅
    </button>
  )}
</div>

      {expanded && (
        <div
          className="reservation-expanded"
          onClick={e => e.stopPropagation()}
        >
          <div className="reservation-grid">
            <div>
              <span className="label">Valor previsto</span>
              <strong>{money(bill.valor_previsto)}</strong>
            </div>
      
            <div>
              <span className="label">Valor real</span>
              <input
                type="number"
                step="0.01"
                value={valorReal}
                onChange={e => setValorReal(e.target.value)}
              />
            </div>
          </div>
      
          <button
            className="primary-btn full"
            onClick={salvarValorReal}
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}






