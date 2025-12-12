import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import CardTransactions from "./CardTransactions";
import { money } from "../utils/money";
import { motion } from "framer-motion";
import { getCategories } from "../services/categories.service";

const nomesMeses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function proximoMes(mesAtual, incremento = 1) {
  const [m, y] = mesAtual.split("/");
  const index = nomesMeses.indexOf(m);
  const date = new Date(2000 + Number(y), index);
  date.setMonth(date.getMonth() + incremento);
  return nomesMeses[date.getMonth()] + "/" + String(date.getFullYear()).slice(2);
}

export default function ExternoDrawer({ open, onClose, mes }) {

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [categories, setCategories] = useState([]);

  function formatarMes(mesISO) {
  const [ano, mes] = mesISO.split("-");
  return `${nomesMeses[Number(mes) - 1]}/${ano.slice(2)}`;
}

const [mesFiltro, setMesFiltro] = useState(() => formatarMes(mes));

useEffect(() => {
  if (mes) {
    setMesFiltro(formatarMes(mes));
  }
}, [mes]);


  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    mes: "",
    parcelas: "1/1",
    quem: "",
    quem_paga: "",
    status: "Pendente",
    category_id: "",
    origem: "Externo"
  });

  // 🔹 carregar categorias
  useEffect(() => {
    getCategories().then(c => setCategories(c.filter(x => x.active)));
  }, []);

  // TOTAL DA FATURA EXTERNA (pendente, ambos em dobro)
  const total = transactions
    .filter(t => (t.status || "").toLowerCase() === "pendente")
    .reduce((sum, t) => {
      const v = Number(t.valor);
      if (isNaN(v)) return sum;
      const mult = (t.quem || "").toLowerCase() === "ambos" ? 2 : 1;
      return sum + v * mult;
    }, 0);

  // TOTAL POR PESSOA (EXTERNO)
  const porPessoa = {
    amanda: 0,
    celso: 0
  };

  transactions
    .filter(t => (t.status || "").toLowerCase() === "pendente")
    .forEach(t => {
      const v = Number(t.valor);
      if (isNaN(v)) return;

      const quem = (t.quem || "").toLowerCase();

      if (quem === "amanda") porPessoa.amanda += v;
      if (quem === "celso") porPessoa.celso += v;
      if (quem === "ambos") {
        porPessoa.amanda += v;
        porPessoa.celso += v;
      }
    });

  // carregar transações externas por mês
  useEffect(() => {
    if (!open) return;

    async function loadData() {
      setLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("origem", "Externo")
        .eq("mes", mesFiltro)
        .order("id", { ascending: false });

      if (error) console.error("Erro externo:", error);
      setTransactions(data || []);
      setLoading(false);
    }

    loadData();
  }, [open, mesFiltro]);

  async function salvarCompra(e) {
    e.preventDefault();

    const [parcelaAtual, totalParcelas] = form.parcelas.split("/").map(Number);

    if (!totalParcelas || parcelaAtual > totalParcelas) {
      alert("Parcelas inválidas. Ex: 3/10");
      return;
    }

    const inserts = [];

    for (let i = parcelaAtual - 1; i < totalParcelas; i++) {
      inserts.push({
        descricao: form.descricao,
        valor: Number(form.valor),
        mes: proximoMes(form.mes, i - (parcelaAtual - 1)),
        parcelas: `${i + 1}/${totalParcelas}`,
        quem: form.quem,
        quem_paga: form.quem_paga || null,
        status: "Pendente",
        origem: "Externo",
        category_id: form.category_id || null
      });
    }

    const { error } = await supabase.from("transactions").insert(inserts);

    if (error) {
      alert("Erro ao salvar compra externa");
      console.error(error);
      return;
    }

    setTransactions(prev => [inserts[0], ...prev]);

    setForm({
      descricao: "",
      valor: "",
      mes: "",
      parcelas: "1/1",
      quem: "",
      quem_paga: "",
      status: "Pendente",
      category_id: "",
      origem: "Externo"
    });

    setShowForm(false);
  }

  if (!open) return null;

  return (
    <div className="drawer-overlay">
      <aside className="drawer">

        <div className="drawer-header">
          <h2>Compras externas</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">

          {/* FILTRO DE MÊS */}
          <div className="drawer-filter">
            <button onClick={() => setMesFiltro(m => proximoMes(m,-1))}>◀</button>
            <strong>{mesFiltro}</strong>
            <button onClick={() => setMesFiltro(m => proximoMes(m,1))}>▶</button>
          </div>

          {/* TOTAL */}
          <div className="drawer-total">
            Total externo: <strong>{money(total)}</strong>
          </div>

          <div className="drawer-total" style={{ justifyContent: "space-around" }}>
            <span>Amanda: <strong>{money(porPessoa.amanda)}</strong></span>
            <span>Celso: <strong>{money(porPessoa.celso)}</strong></span>
          </div>

          <button
            className="mark-month-btn"
            onClick={async () => {
              if (!window.confirm("Marcar todas as compras externas como pagas?")) return;
              const { error } = await supabase
                .from("transactions")
                .update({ status: "Pago" })
                .eq("origem", "Externo")
                .eq("mes", mesFiltro)
                .eq("status", "Pendente");

              if (!error) window.location.reload();
            }}
          >
            Marcar mês como pago ✅
          </button>

          <button className="primary-btn" onClick={() => setShowForm(v => !v)}>
            + Nova compra externa
          </button>

          {showForm && (
            <motion.form
              className="purchase-form"
              onSubmit={salvarCompra}
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
                placeholder="Valor da parcela"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
                required
              />

              <input
                placeholder="Dez/25"
                value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })}
                required
              />

              <input
                placeholder="Parcelas (3/10)"
                value={form.parcelas}
                onChange={e => setForm({ ...form, parcelas: e.target.value })}
                required
              />

              <select
                value={form.quem}
                onChange={e => setForm({ ...form, quem: e.target.value })}
                required
              >
                <option value="" disabled>Quem comprou?</option>
                <option>Amanda</option>
                <option>Celso</option>
                <option>Ambos</option>
              </select>

              <select
                value={form.quem_paga}
                onChange={e => setForm({ ...form, quem_paga: e.target.value })}
              >
                <option value="" disabled>Quem paga?</option>
                <option>Amanda</option>
                <option>Celso</option>
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

              <input value="Externo" disabled />

              <button className="primary-btn" type="submit">
                Salvar compra
              </button>
            </motion.form>
          )}

          {loading
            ? <div className="card-transactions empty">Carregando...</div>
            : <CardTransactions transactions={transactions} />
          }

        </div>

      </aside>
    </div>
  );
}
