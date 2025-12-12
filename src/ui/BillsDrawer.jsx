import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { getBills } from "../services/bills.service";
import { supabase } from "../services/supabase";
import { isoParaMesAbrev, mesAbrevParaISO, incrementarMes } from "../core/dates";
import { money } from "../utils/money";

export default function BillsDrawer({ open, onClose, mes }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtro de mês interno
  const [mesFiltro, setMesFiltro] = useState(mes);

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

  const mesFmt = isoParaMesAbrev(mesFiltro); // "2025-12" -> "Dez/25"

  // filtra só as do mês selecionado
  const lista = bills
    .filter(b => !mesFmt || b.mes === mesFmt)
    .sort((a, b) => {
      const statusA = (a.status || "").toLowerCase();
      const statusB = (b.status || "").toLowerCase();

      const pagoA = statusA === "pago";
      const pagoB = statusB === "pago";

      if (pagoA !== pagoB) {
        // pendentes primeiro
        return pagoA ? 1 : -1;
      }

      return (a.conta || "").localeCompare(b.conta || "");
    });

  function toggleForm() {
    setShowForm(v => {
      const novo = !v;
      if (novo) {
        // ao abrir, preenche mês padrão
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
      mes: form.mes, // "Dez/25"
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
    // se já tiver valor_real, mantém. senão usa valor_previsto
    const valor = bill.valor_real != null && bill.valor_real !== 0
      ? bill.valor_real
      : (bill.valor_previsto ?? 0);

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
        b.id === bill.id ? { ...b, valor_real: valor, status: "Pago" } : b
      )
    );
  }

  function mesAnterior() {
    const atualAbrev = isoParaMesAbrev(mesFiltro); // "Dez/25"
    const anteriorAbrev = incrementarMes(atualAbrev, -1);
    setMesFiltro(mesAbrevParaISO(anteriorAbrev));
  }

  function mesProximo() {
    const atualAbrev = isoParaMesAbrev(mesFiltro);
    const proxAbrev = incrementarMes(atualAbrev, 1);
    setMesFiltro(mesAbrevParaISO(proxAbrev));
  }

  if (!open) return null;

  return (
    <div className="drawer-overlay">
      <aside className="drawer">

        <div className="drawer-header">
          <h2>Contas da casa</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">

          {/* FILTRO DE MÊS */}
          <div className="drawer-filter">
            <button onClick={mesAnterior}>◀</button>
            <strong>{mesFmt || "-"}</strong>
            <button onClick={mesProximo}>▶</button>
          </div>

          {/* BOTÃO NOVA CONTA */}
          <button
            className="primary-btn"
            onClick={toggleForm}
          >
            {showForm ? "Fechar" : "+ Nova conta"}
          </button>

          {/* FORM NOVA CONTA */}
          {showForm && (
            <form className="purchase-form" onSubmit={salvarConta}>
              <input
                placeholder="Nome da conta (ex: Luz, Água...)"
                value={form.conta}
                onChange={e => setForm({ ...form, conta: e.target.value })}
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Valor previsto"
                value={form.valor_previsto}
                onChange={e => setForm({ ...form, valor_previsto: e.target.value })}
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Valor real (opcional)"
                value={form.valor_real}
                onChange={e => setForm({ ...form, valor_real: e.target.value })}
              />

              <input
                placeholder="Mês (ex: Dez/25)"
                value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })}
                required
              />

              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option>Pendente</option>
                <option>Pago</option>
              </select>

              <button className="primary-btn" type="submit">
                Salvar conta
              </button>
            </form>
          )}

          {/* LISTA */}
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
              {lista.map(b => (
                <BillRow
                  key={b.id}
                  bill={b}
                  onMarkPaid={marcarComoPago}
                />
              ))}
            </div>
          )}

        </div>
      </aside>
    </div>
  );
}

function BillRow({ bill, onMarkPaid }) {
  const previsto = bill.valor_previsto ?? 0;
  const real = bill.valor_real ?? null;

  const status = (bill.status || "").toLowerCase();
	const pago = status === "pago";

	// regra: se valor_real tiver valor, usa ele; se for 0/vazio, usa previsto
	const valorMostrar =
	  Number(bill.valor_real || 0) || Number(bill.valor_previsto || 0);


  return (
    <div className="history-row">
      <div className="history-desc">
        <span className="title">{bill.conta || "Conta"}</span>
        <span className="sub">
          {bill.mes} • {pago ? "Pago" : "Pendente"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
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
    </div>
  );
}
