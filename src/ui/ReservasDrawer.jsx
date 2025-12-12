import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { motion } from "framer-motion";
import { money } from "../utils/money";
import { getCategories } from "../services/categories.service";

/* ===============================
   UTILITÁRIOS DE DATA
================================ */

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function addMonths(mesStr, qtd) {
  const [m, y] = mesStr.split("/");
  const d = new Date(2000 + Number(y), MESES.indexOf(m));
  d.setMonth(d.getMonth() + qtd);
  return `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function proximoMes(r) {
  if (!r.ultimo_mes) return r.mes;

  switch (r.recorrencia) {
    case "Mensal":     return addMonths(r.ultimo_mes, 1);
    case "Bimestral":  return addMonths(r.ultimo_mes, 2);
    case "Trimestral": return addMonths(r.ultimo_mes, 3);
    case "Única":      return null;
    case "Parcelado": {
      const [atual, total] = (r.parcelas || "1/1").split("/").map(Number);
      return atual < total ? addMonths(r.ultimo_mes, 1) : null;
    }
    default:
      return addMonths(r.ultimo_mes, 1);
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
    mes: "",
    ultimo_mes: "",
    recorrencia: "Mensal",
    parcelas: "1/1",
    quem: "",
    quem_paga: "",
    origem: "",
    category_id: ""
  });

  // 🔹 carregar categorias
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
        .order("id", { ascending: false });

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

    setReservas(prev => [data, ...prev]);
    setShowForm(false);

    setForm({
      descricao: "",
      valor: "",
      mes: "",
      ultimo_mes: "",
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
    const mes = proximoMes(r);
    if (!mes) return alert("Esta reserva já foi concluída.");

    // 1) gerar lançamento
    const { error: e1 } = await supabase.from("transactions").insert([{
      descricao: r.descricao,
      valor: Number(r.valor),
      mes,
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

    const novoUltimo = mes;
    const prox = proximoMes({ ...r, ultimo_mes: novoUltimo });

    const payload = prox
      ? { ultimo_mes: novoUltimo, parcelas: avancaParcela(r) }
      : { ultimo_mes: novoUltimo, recorrencia: "Concluída" };

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
                placeholder="Mês inicial (ex: Jan/26)"
                value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })}
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

              {/* ✅ CATEGORIA VIA FK */}
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
                .map(r => ({ ...r, proximo: proximoMes(r) }))
                .filter(r => r.proximo)
                .sort((a, b) => a.proximo.localeCompare(b.proximo))
                .map(r => (
                  <ReservaRow key={r.id} r={r} onProcessar={processarReserva} />
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
   LINHA EXPANSÍVEL
================================ */

function ReservaRow({ r, onProcessar }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="history-row" onClick={() => setOpen(v => !v)}>
      <div className="history-desc reserva-row">
        <span className="reserve-month">{r.proximo}</span>
        <span className="title">{r.descricao}</span>
      </div>
      <strong className="amount">{money(r.valor)}</strong>

      {open && (
        <div className="txn-details">
          <div><span>Origem</span><strong>{r.origem}</strong></div>
          <div><span>Quem paga</span><strong>{r.quem_paga || "-"}</strong></div>
          <div><span>Recorrência</span><strong>{r.recorrencia}</strong></div>
          <div><span>Último mês</span><strong>{r.ultimo_mes || "-"}</strong></div>
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
