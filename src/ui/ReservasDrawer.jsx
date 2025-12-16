import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { motion } from "framer-motion";
import { money } from "../utils/money";
import { getCategories } from "../services/categories.service";

/* ===============================
   UTILITÁRIOS DE DATA (DATE REAL)
================================ */

function addMonthsDate(dateStr, qtd) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + qtd);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function proximaDataReserva(r) {
  if (!r.data_real) return null;

  switch (r.recorrencia) {
    case "Mensal":
      return addMonthsDate(r.data_real, 1);

    case "Bimestral":
      return addMonthsDate(r.data_real, 2);

    case "Trimestral":
      return addMonthsDate(r.data_real, 3);

    case "Única":
      return null;

    case "Parcelado": {
      const [atual, total] = (r.parcelas || "1/1").split("/").map(Number);
      return atual < total
        ? addMonthsDate(r.data_real, 1)
        : null;
    }

    default:
      return addMonthsDate(r.data_real, 1);
  }
}

function avancaParcela(r) {
  if (r.recorrencia !== "Parcelado") return r.parcelas;
  const [a, t] = (r.parcelas || "1/1").split("/").map(Number);
  return `${Math.min(a + 1, t)}/${t}`;
}

/* ===============================
   COMPONENTE
================================ */

export default function ReservasDrawer({ open, onClose }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data_real: "",
    recorrencia: "Mensal",
    parcelas: "1/1",
    quem: "",
    quem_paga: "",
    origem: "",
    category_id: ""
  });

  /* ===============================
     CATEGORIAS
  ================================ */

  useEffect(() => {
    getCategories().then(c => setCategories(c.filter(x => x.active)));
  }, []);

  /* ===============================
     BUSCAR RESERVAS
  ================================ */

  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select("*, categories(name)")
        .order("data_real", { ascending: true });

      if (error) console.error(error);
      setReservas(data || []);
      setLoading(false);
    }

    load();
  }, [open]);

  /* ===============================
     SALVAR RESERVA
  ================================ */

  async function salvarReserva(e) {
    e.preventDefault();

    const payload = {
      ...form,
      valor: Number(form.valor),
      ultimo_mes: null,
      category_id: form.category_id || null
    };

    const { error, data } = await supabase
      .from("reservations")
      .insert([payload])
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar reserva");
      console.error(error);
      return;
    }

    setReservas(prev => [...prev, data]);
    setShowForm(false);

    setForm({
      descricao: "",
      valor: "",
      data_real: "",
      recorrencia: "Mensal",
      parcelas: "1/1",
      quem: "",
      quem_paga: "",
      origem: "",
      category_id: ""
    });
  }

  /* ===============================
     PROCESSAR RESERVA
  ================================ */

  async function processarReserva(r) {
    if (!r.data_real) return;

    // 1️⃣ Criar transaction
    const { error: e1 } = await supabase.from("transactions").insert([{
      descricao: r.descricao,
      valor: Number(r.valor),
      data_real: r.data_real,
      parcelas: r.recorrencia === "Parcelado" ? r.parcelas : "1/1",
      quem: r.quem || "Amanda",
      quem_paga: r.quem_paga || null,
      status: "Pendente",
      category_id: r.category_id || null,
      origem: r.origem || "Externo"
    }]);

    if (e1) {
      alert("Erro ao gerar transação");
      console.error(e1);
      return;
    }

    // 2️⃣ Calcular próxima data
    const proximaData = proximaDataReserva(r);

    const payload = proximaData
      ? {
          ultimo_mes: r.data_real,
          data_real: proximaData,
          parcelas: avancaParcela(r)
        }
      : {
          ultimo_mes: r.data_real,
          recorrencia: "Concluída"
        };

    const { error: e2 } = await supabase
      .from("reservations")
      .update(payload)
      .eq("id", r.id);

    if (e2) {
      alert("Erro ao atualizar reserva");
      console.error(e2);
      return;
    }

    setReservas(prev =>
      prev.map(x => x.id === r.id ? { ...x, ...payload } : x)
    );
  }

  if (!open) return null;

  /* ===============================
     RENDER
  ================================ */

  return (
    <div className="drawer-overlay">
      <aside className="drawer">
        <div className="drawer-header">
          <h2>Reservas</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">
          <button className="primary-btn" onClick={() => setShowForm(v => !v)}>
            + Nova reserva
          </button>

          {showForm && (
            <motion.form
              className="purchase-form"
              onSubmit={salvarReserva}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                placeholder="Descrição"
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
                required
              />

              <input
                type="date"
                value={form.data_real}
                onChange={e => setForm({ ...form, data_real: e.target.value })}
                required
              />

              <select
                value={form.recorrencia}
                onChange={e => setForm({ ...form, recorrencia: e.target.value })}
              >
                <option>Mensal</option>
                <option>Bimestral</option>
                <option>Trimestral</option>
                <option>Parcelado</option>
                <option>Única</option>
              </select>

              {form.recorrencia === "Parcelado" && (
                <input
                  placeholder="Parcelas (3/10)"
                  value={form.parcelas}
                  onChange={e => setForm({ ...form, parcelas: e.target.value })}
                  required
                />
              )}

              <select
                value={form.origem}
                onChange={e => setForm({ ...form, origem: e.target.value })}
                required
              >
                <option value="" disabled>Origem</option>
                <option>NU Amanda</option>
                <option>NU Celso</option>
                <option>SI Amanda</option>
                <option>BB Celso</option>
                <option>Externo</option>
              </select>

              {form.origem === "Externo" && (
                <select
                  value={form.quem_paga}
                  onChange={e => setForm({ ...form, quem_paga: e.target.value })}
                  required
                >
                  <option value="" disabled>Quem paga?</option>
                  <option>Amanda</option>
                  <option>Celso</option>
                </select>
              )}

              <select
                value={form.quem}
                onChange={e => setForm({ ...form, quem: e.target.value })}
                required
              >
                <option value="" disabled>Quem é a reserva?</option>
                <option>Amanda</option>
                <option>Celso</option>
                <option>Ambos</option>
              </select>

              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                required
              >
                <option value="">Categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button className="primary-btn" type="submit">
                Salvar reserva
              </button>
            </motion.form>
          )}

          {loading ? (
            <div className="card-transactions empty">Carregando...</div>
          ) : (
            <div className="card-transactions">
              {reservas
                .filter(r => r.recorrencia !== "Concluída")
                .map(r => (
                  <ReservaRow
                    key={r.id}
                    r={r}
                    onProcessar={processarReserva}
                  />
                ))
              }
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ===============================
   LINHA
================================ */

function ReservaRow({ r, onProcessar }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="history-row" onClick={() => setOpen(v => !v)}>
      <div className="history-desc reserva-row">
        <span className="reserve-month">{r.data_real}</span>
        <span className="title">{r.descricao}</span>
      </div>

      <strong className="amount">{money(r.valor)}</strong>

      {open && (
        <div className="txn-details">
          <div><span>Origem</span><strong>{r.origem}</strong></div>
          <div><span>Quem paga</span><strong>{r.quem_paga || "-"}</strong></div>
          <div><span>Recorrência</span><strong>{r.recorrencia}</strong></div>
          <div><span>Última cobrança</span><strong>{r.ultimo_mes || "-"}</strong></div>
          <div><span>Categoria</span><strong>{r.categories?.name || "-"}</strong></div>
          {r.parcelas && <div><span>Parcelas</span><strong>{r.parcelas}</strong></div>}

          <button
            className="mark-paid-btn"
            onClick={(e) => {
              e.stopPropagation();
              onProcessar(r);
            }}
          >
            Processar ✅
          </button>
        </div>
      )}
    </div>
  );
}
