import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { money } from "../utils/money";
import { getCategories } from "../services/categories.service";

/* ===============================
   UTILITÁRIOS
================================ */

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function addMonthsDate(dateStr, qtd) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + qtd);
  return d.toISOString().slice(0, 10);
}

function formatarDataBR(data) {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function resolverQuemPagaPorOrigem(origem) {
  if (!origem) return "";
  if (origem.includes("Amanda")) return "Amanda";
  if (origem.includes("Celso")) return "Celso";
  return "";
}

function avancarMes(mesInicial, incremento) {
  if (!mesInicial) return null;
  const [m, y] = mesInicial.split("/");
  const index = MESES.indexOf(m);
  const data = new Date(2000 + Number(y), index);
  data.setMonth(data.getMonth() + incremento);
  return `${MESES[data.getMonth()]}/${String(data.getFullYear()).slice(2)}`;
}

function proximaDataReserva(r) {
  switch (r.recorrencia) {
    case "Mensal":     return addMonthsDate(r.data_real, 1);
    case "Bimestral":  return addMonthsDate(r.data_real, 2);
    case "Trimestral": return addMonthsDate(r.data_real, 3);
    case "Parcelado":  return addMonthsDate(r.data_real, 1);
    case "Única":      return null;
    default:           return addMonthsDate(r.data_real, 1);
  }
}

function proximoMesReserva(r) {
  switch (r.recorrencia) {
    case "Mensal":     return avancarMes(r.mes, 1);
    case "Bimestral":  return avancarMes(r.mes, 2);
    case "Trimestral": return avancarMes(r.mes, 3);
    case "Parcelado":  return avancarMes(r.mes, 1);
    default:           return null;
  }
}

/* ===============================
   COMPONENTE
================================ */

export default function ReservasDrawer({ open, onClose }) {
  const [reservas, setReservas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data_real: "",
    mes: "",
    recorrencia: "Mensal",
    parcelas: "1/1",
    quem: "",
    quem_paga: "",
    origem: "",
    category_id: ""
  });

  useEffect(() => {
    getCategories().then(c => setCategories(c.filter(x => x.active)));
  }, []);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    supabase
      .from("reservations")
      .select("*, categories(name)")
      .order("data_real", { ascending: true })
      .then(({ data }) => {
        setReservas(data || []);
        setLoading(false);
      });
  }, [open]);

  async function salvarReserva(e) {
    e.preventDefault();

    if (!form.mes) {
      alert("Informe a fatura (ex: Jan/26)");
      return;
    }

    if (!form.origem) {
      alert("Informe a origem");
      return;
    }

    if (form.origem === "Externo" && !form.quem_paga) {
      alert("Informe quem paga");
      return;
    }

    const quemPagaFinal =
      form.origem === "Externo"
        ? form.quem_paga
        : resolverQuemPagaPorOrigem(form.origem);

    const { data, error } = await supabase
      .from("reservations")
      .insert([{
        ...form,
        valor: Number(form.valor),
        quem_paga: quemPagaFinal,
        category_id: form.category_id || null
      }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Erro ao salvar reserva");
      return;
    }

    setReservas(prev =>
      [...prev, data].sort((a, b) => new Date(a.data_real) - new Date(b.data_real))
    );

    setShowForm(false);
    setForm({
      descricao: "",
      valor: "",
      data_real: "",
      mes: "",
      recorrencia: "Mensal",
      parcelas: "1/1",
      quem: "",
      quem_paga: "",
      origem: "",
      category_id: ""
    });
  }

  async function processarReserva(r) {
    if (!r.data_real) return;

    await supabase.from("transactions").insert([{
      descricao: r.descricao,
      valor: Number(r.valor),
      data_real: r.data_real,
      mes: r.mes,
      parcelas: r.recorrencia === "Parcelado" ? r.parcelas : "1/1",
      quem: r.quem || "Amanda",
      quem_paga: r.quem_paga || null,
      status: "Pendente",
      origem: r.origem,
      category_id: r.category_id || null
    }]);

    const novaData = proximaDataReserva(r);
    const novoMes = proximoMesReserva(r);

    if (!novaData || !novoMes) return;

    await supabase
      .from("reservations")
      .update({
        data_real: novaData,
        mes: novoMes
      })
      .eq("id", r.id);

    setReservas(prev =>
      prev
        .map(x => x.id === r.id ? { ...x, data_real: novaData, mes: novoMes } : x)
        .sort((a, b) => new Date(a.data_real) - new Date(b.data_real))
    );
  }

  if (!open) return null;

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
            <form className="purchase-form" onSubmit={salvarReserva}>
              <input placeholder="Descrição" value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })} />

              <input type="number" step="0.01" placeholder="Valor" value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })} />

              <input type="date" value={form.data_real}
                onChange={e => setForm({ ...form, data_real: e.target.value })} />

              <input placeholder="Fatura (ex: Jan/26)" value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })} />

              <select value={form.recorrencia}
                onChange={e => setForm({ ...form, recorrencia: e.target.value })}>
                <option>Mensal</option>
                <option>Bimestral</option>
                <option>Trimestral</option>
                <option>Parcelado</option>
                <option>Única</option>
              </select>

              <select value={form.origem}
                onChange={e => {
                  const origem = e.target.value;
                  setForm(f => ({
                    ...f,
                    origem,
                    quem_paga:
                      origem === "Externo"
                        ? ""
                        : resolverQuemPagaPorOrigem(origem)
                  }));
                }}>
                <option value="">Origem</option>
                <option>NU Amanda</option>
                <option>NU Celso</option>
                <option>SI Amanda</option>
                <option>BB Celso</option>
                <option>Externo</option>
              </select>

              {form.origem === "Externo" && (
                <select value={form.quem_paga}
                  onChange={e => setForm({ ...form, quem_paga: e.target.value })}>
                  <option value="">Quem paga?</option>
                  <option>Amanda</option>
                  <option>Celso</option>
                </select>
              )}

              <button className="primary-btn" type="submit">
                Salvar reserva
              </button>
            </form>
          )}

          {loading ? (
            <div className="card-transactions empty">Carregando...</div>
          ) : (
            reservas.map(r => (
              <div key={r.id} className="history-row">
                <span>{formatarDataBR(r.data_real)}</span>
                <strong>{money(r.valor)}</strong>
                <button onClick={() => processarReserva(r)}>Processar</button>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
