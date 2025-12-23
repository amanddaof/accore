import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { money } from "../utils/money";
import AnnualSummaryCards from "./AnnualSummaryCards";

/* ======================================================
   CONSTANTES
====================================================== */

const mesesNomes = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

/* ======================================================
   HELPERS
====================================================== */

function gerarMesesAno(ano) {
  return mesesNomes.map(m => `${m}/${String(ano).slice(2)}`);
}

function intervaloDaRecorrencia(rec) {
  const mapa = {
    mensal: 1,
    bimestral: 2,
    trimestral: 3,
    semestral: 6,
    anual: 12,
    parcelado: 1
  };

  return mapa[String(rec || "").toLowerCase()] || 1;
}

/* ======================================================
   COMPONENTE
====================================================== */

export default function AnnualEvolutionChart() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [anos, setAnos] = useState([]);
  const [data, setData] = useState([]);

  /* ================= LOAD INICIAL ================= */

  useEffect(() => {
    carregarAnos();
  }, []);

  useEffect(() => {
    carregarAnoSelecionado();
  }, [ano]);

  /* ================= ANOS DISPONÍVEIS ================= */

  async function carregarAnos() {
    const tabelas = ["transactions", "bills", "reservations", "loans"];
    const anosSet = new Set();

    for (const tabela of tabelas) {
      const { data } = await supabase.from(tabela).select("mes");

      data?.forEach(r => {
        const y = Number("20" + String(r.mes || "").split("/")[1]);
        if (!isNaN(y)) anosSet.add(y);
      });
    }

    const lista = Array.from(anosSet).sort();
    setAnos(lista);

    const anoAtual = new Date().getFullYear();
    if (lista.includes(anoAtual)) setAno(anoAtual);
    else if (lista.length) setAno(lista[lista.length - 1]);
  }

  /* ================= CARGA DO ANO ================= */

  async function carregarAnoSelecionado() {
    const meses = gerarMesesAno(ano);

    const [
      { data: trans },
      { data: bills },
      { data: loans },
      { data: reserves }
    ] = await Promise.all([
      supabase.from("transactions").select("mes, valor, quem").in("mes", meses),
      supabase.from("bills").select("*").in("mes", meses),
      supabase.from("loans").select("mes, valor").in("mes", meses),
      supabase.from("reservations").select("mes, valor, quem, recorrencia, parcelas")
    ]);

    /* ================= MAPA BASE ================= */

    const mapa = {};
    meses.forEach(m => {
      mapa[m] = { mes: m, amanda: 0, celso: 0, total: 0 };
    });

    /* ================= TRANSACTIONS ================= */

    trans?.forEach(t => {
      const m = t.mes;
      if (!mapa[m]) return;

      const v = Number(t.valor || 0);
      const pessoa = String(t.quem || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

      if (pessoa === "amanda") mapa[m].amanda += v;
      if (pessoa === "celso") mapa[m].celso += v;
      if (pessoa === "ambos") {
        mapa[m].amanda += v;
        mapa[m].celso += v;
      }
    });

    /* ================= BILLS (50/50) ================= */

    bills?.forEach(b => {
      const m = b.mes;
      if (!mapa[m]) return;

      const real = Number(b.valor_real || b.valorReal || b["valor-real"] || 0);
      const prev = Number(b.valor_previsto || b.valorPrevisto || b["valor-previsto"] || 0);
      const v = real > 0 ? real : prev;

      mapa[m].amanda += v / 2;
      mapa[m].celso += v / 2;
    });

    /* ================= LOANS (Celso) ================= */

    loans?.forEach(l => {
      const m = l.mes;
      if (!mapa[m]) return;

      mapa[m].celso += Number(l.valor || 0);
    });

    /* ================= RESERVATIONS ================= */

    reserves?.forEach(r => {
      const valor = Number(r.valor || 0);
      const pessoa = String(r.quem || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

      const intervalo = intervaloDaRecorrencia(r.recorrencia);
      const parcelas = r.parcelas ? Number(r.parcelas) : null;

      const [mCriadoNome, yCriado] = String(r.mes).split("/");
      const anoCriado = Number("20" + yCriado);
      const mesCriadoIdx = mesesNomes.indexOf(mCriadoNome);

      meses.forEach(mLabel => {
        const [mAtualNome, yAtual] = mLabel.split("/");
        const anoAtual = Number("20" + yAtual);
        const mesAtualIdx = mesesNomes.indexOf(mAtualNome);

        const diffMeses =
          (anoAtual - anoCriado) * 12 +
          (mesAtualIdx - mesCriadoIdx);

        if (diffMeses < 0) return;
        if (diffMeses % intervalo !== 0) return;

        const ordem = Math.floor(diffMeses / intervalo) + 1;
        if (parcelas !== null && ordem > parcelas) return;

        const jaExiste = trans?.some(t => {
          const p = String(t.quem || "").trim().toLowerCase();
          return t.mes === mLabel && p === pessoa && Number(t.valor) === valor;
        });
        if (jaExiste) return;

        if (pessoa === "amanda") mapa[mLabel].amanda += valor;
        if (pessoa === "celso") mapa[mLabel].celso += valor;
        if (pessoa === "ambos") {
          mapa[mLabel].amanda += valor;
          mapa[mLabel].celso += valor;
        }
      });
    });

    /* ================= TOTAL ================= */

    Object.values(mapa).forEach(m => {
      m.total = Number((m.amanda + m.celso).toFixed(2));
    });

    setData(Object.values(mapa));
  }

  /* ================= RENDER ================= */

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>Ano:</label>
        <select value={ano} onChange={e => setAno(Number(e.target.value))}>
          {anos.map(y => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      <AnnualSummaryCards data={data} />

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip formatter={v => money(v)} />
          <Legend />

          <Line type="monotone" dataKey="amanda" name="Amanda" stroke="#A78BFA" />
          <Line type="monotone" dataKey="celso" name="Celso" stroke="#38BDF8" />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#FBBF24"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
