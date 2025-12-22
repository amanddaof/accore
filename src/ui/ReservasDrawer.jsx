import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { motion } from "framer-motion";
import { money } from "../utils/money";
import { getCategories } from "../services/categories.service";

/* ===============================
   UTILITÁRIOS DE DATA
================================ */

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

function proximaDataReserva(r) {
  if (!r.data_real) return null;

  switch (r.recorrencia) {
    case "Mensal":     return addMonthsDate(r.data_real, 1);
    case "Bimestral":  return addMonthsDate(r.data_real, 2);
    case "Trimestral": return addMonthsDate(r.data_real, 3);
    case "Única":      return null;
    case "Parcelado": {
      const [a, t] = (r.parcelas || "1/1").split("/").map(Number);
      return a < t ? addMonthsDate(r.data_real, 1) : null;
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
    mes: "",
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

   function avancarMesReserva(mesInicial, recorrencia) {
  if (!mesInicial) return null;

  const [mesAbrev, anoAbrev] = mesInicial.split("/");
  const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const mesIndex = nomes.indexOf(mesAbrev);

  const data = new Date(2000 + Number(anoAbrev), mesIndex);

  switch (recorrencia) {
    case "Mensal":
      data.setMonth(data.getMonth() + 1);
      break;
    case "Bimestral":
      data.setMonth(data.getMonth() + 2);
      break;
    case "Trimestral":
      data.setMonth(data.getMonth() + 3);
      break;
    case "Parcelado":
      data.setMonth(data.getMonth() + 1);
      break;
    default:
      return null;
  }

  return `${nomes[data.getMonth()]}/${String(data.getFullYear()).slice(2)}`;
}

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

    setReservas(prev =>
      [...prev, data].sort(
        (a, b) => new Date(a.data_real) - new Date(b.data_real)
      )
    );

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

    // 1️⃣ cria transação
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

    // 2️⃣ calcula próxima data
    const proximaData = proximaDataReserva(r);
   const proximoMes = avancarMesReserva(r.mes, r.recorrencia);
   
   const payload = proximaData
     ? {
         ultimo_mes: r.data_real,
         data_real: proximaData,
         mes: proximoMes,          // ✅ AQUI
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

    // 🔑 AQUI ESTÁ O AJUSTE IMPORTANTE
    setReservas(prev =>
      prev
        .map(x => x.id === r.id ? { ...x, ...payload } : x)
        .filter(r => r.recorrencia !== "Concluída")
        .sort((a, b) => new Date(a.data_real) - new Date(b.data_real))
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

          {loading ? (
            <div className="card-transactions empty">Carregando...</div>
          ) : (
            <div className="card-transactions">
              {reservas.map(r => (
                <ReservaRow
                  key={r.id}
                  r={r}
                  onProcessar={processarReserva}
                />
              ))}
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
        <span className="reserve-month">
          {formatarDataBR(r.data_real)}
        </span>
        <span className="title">{r.descricao}</span>
      </div>

      <strong className="amount">{money(r.valor)}</strong>

      {open && (
        <div className="txn-details">
          <div><span>Origem</span><strong>{r.origem}</strong></div>
          <div><span>Quem paga</span><strong>{r.quem_paga || "-"}</strong></div>
          <div><span>Recorrência</span><strong>{r.recorrencia}</strong></div>
          <div>
            <span>Última cobrança</span>
            <strong>{formatarDataBR(r.ultimo_mes)}</strong>
          </div>
          <div><span>Categoria</span><strong>{r.categories?.name || "-"}</strong></div>

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

