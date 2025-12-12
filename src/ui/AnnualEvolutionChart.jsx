import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { money } from "../utils/money";
import AnnualSummaryCards from "./AnnualSummaryCards";

const mesesNomes = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function gerarMesesAno(ano) {
  return mesesNomes.map((m) => `${m}/${String(ano).slice(2)}`);
}

// ===== MAPEIA TEXTO -> INTERVALO (meses)
function intervaloDaRecorrencia(rec) {
  const mapa = {
    mensal: 1,
    bimestral: 2,
    trimestral: 3,
    semestral: 6,
    anual: 12,
    parcelado: 1,
  };
  return mapa[String(rec || "").toLowerCase()] || 1; // default = mensal
}

export default function AnnualEvolutionChart() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [anos, setAnos] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    carregarAnos();
  }, []);

  useEffect(() => {
    carregarAnoSelecionado();
  }, [ano]);

  async function carregarAnos() {
    const tabelas = ["transactions", "bills", "reservations", "loans"];
    const anosSet = new Set();

    for (const tabela of tabelas) {
      const { data } = await supabase.from(tabela).select("mes");
      data?.forEach((r) => {
        const y = Number("20" + String(r.mes || "").split("/")[1]);
        if (!isNaN(y)) anosSet.add(y);
      });
    }

    const lista = Array.from(anosSet).sort();
    setAnos(lista);

    const anoAtual = new Date().getFullYear();
    if (lista.includes(anoAtual)) setAno(anoAtual);
    else if (lista.length) setAno(lista[lista.length - 1]); // fallback
  }

  async function carregarAnoSelecionado() {
    const meses = gerarMesesAno(ano);

    const [
      { data: trans },
      { data: bills },
      { data: loans },
      { data: reserves },
    ] = await Promise.all([
      supabase
        .from("transactions")
        .select("mes, valor, quem")
        .in("mes", meses),
      supabase.from("bills").select("*").in("mes", meses),
      supabase.from("loans").select("mes, valor").in("mes", meses),
      supabase
        .from("reservations")
        .select("mes, valor, quem, recorrencia, parcelas"),
    ]);

    const mapa = {};
    meses.forEach(
      (m) => (mapa[m] = { mes: m, amanda: 0, celso: 0, total: 0 })
    );

    // =========================
    // TRANSACTIONS
    // =========================
    trans?.forEach((t) => {
      const m = t.mes;
      const v = Number(t.valor || 0);
      if (!mapa[m]) return;

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

    // =========================
    // BILLS (50/50)
    // =========================
    bills?.forEach((b) => {
      const m = b.mes;
      if (!mapa[m]) return;

      const valorReal = Number(
        b.valor_real || b.valorReal || b["valor-real"] || 0
      );
      const valorPrev = Number(
        b.valor_previsto || b.valorPrevisto || b["valor-previsto"] || 0
      );
      const v = valorReal > 0 ? valorReal : valorPrev;

      const metade = v / 2;
      mapa[m].amanda += metade;
      mapa[m].celso += metade;
    });

    // =========================
    // LOANS (sempre Celso)
    // =========================
    loans?.forEach((l) => {
      const m = l.mes;
      const v = Number(l.valor || 0);
      if (!mapa[m]) return;

      mapa[m].celso += v;
    });

    // =========================
    // RESERVATIONS (recorrência genérica + parcelado correto)
    // =========================
    reserves?.forEach((r) => {
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

      meses.forEach((mLabel) => {
        const [mAtualNome, yAtual] = mLabel.split("/");
        const anoAtual = Number("20" + yAtual);
        const mesAtualIdx = mesesNomes.indexOf(mAtualNome);

        // diferença em meses desde a criação
        const diffMeses =
          (anoAtual - anoCriado) * 12 + (mesAtualIdx - mesCriadoIdx);

        // não aplica antes da criação
        if (diffMeses < 0) return;

        // respeita periodicidade
        if (diffMeses % intervalo !== 0) return;

        // ✅ PARCELADO CORRETO:
        // calcula a "ordem" da ocorrência (1ª, 2ª, 3ª...)
        const ordem = Math.floor(diffMeses / intervalo) + 1;

        // se for parcelado e passou do limite, não aplica
        if (parcelas !== null && ordem > parcelas) return;

        // não duplica se já existir transaction no mês
        const jaExiste = trans?.some((t) => {
          const p = String(t.quem || "").trim().toLowerCase();
          return (
            t.mes === mLabel &&
            p === pessoa &&
            Number(t.valor) === valor
          );
        });
        if (jaExiste) return;

        // aplica reserva
        if (pessoa === "amanda") mapa[mLabel].amanda += valor;
        if (pessoa === "celso") mapa[mLabel].celso += valor;
        if (pessoa === "ambos") {
          mapa[mLabel].amanda += valor;
          mapa[mLabel].celso += valor;
        }
      });
    });

    // =========================
    // TOTAL = AMANDA + CELSO
    // =========================
    Object.values(mapa).forEach((m) => {
      m.total = Number((m.amanda + m.celso).toFixed(2));
    });

    // =========================
    // DEBUG CIRÚRGICO PARA Mar/AA
    // =========================
    const mesDebug = `Mar/${String(ano).slice(2)}`;

    const somaTrans = (trans || [])
      .filter((t) => t.mes === mesDebug)
      .reduce((s, t) => s + Number(t.valor || 0), 0);

    const somaBills = (bills || [])
      .filter((b) => b.mes === mesDebug)
      .reduce((s, b) => {
        const real = Number(
          b.valor_real || b.valorReal || b["valor-real"] || 0
        );
        const prev = Number(
          b.valor_previsto || b.valorPrevisto || b["valor-previsto"] || 0
        );
        return s + (real > 0 ? real : prev);
      }, 0);

    const somaLoans = (loans || [])
      .filter((l) => l.mes === mesDebug)
      .reduce((s, l) => s + Number(l.valor || 0), 0);

    const somaReservasAplicadas = (() => {
      let total = 0;

      const mapaIntervalo = {
        mensal: 1,
        bimestral: 2,
        trimestral: 3,
        semestral: 6,
        anual: 12,
        parcelado: 1,
      };

      reserves?.forEach((r) => {
        const valor = Number(r.valor || 0);
        const pessoa = String(r.quem || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase();

        const intervalo =
          mapaIntervalo[String(r.recorrencia || "").toLowerCase()] || 1;
        const parcelas = r.parcelas ? Number(r.parcelas) : null;

        const [mCriadoNome, yCriado] = String(r.mes).split("/");
        const anoCriado = Number("20" + yCriado);
        const mesCriadoIdx = mesesNomes.indexOf(mCriadoNome);

        const [mAtualNome, yAtual] = mesDebug.split("/");
        const anoAtual = Number("20" + yAtual);
        const mesAtualIdx = mesesNomes.indexOf(mAtualNome);

        const diffMeses =
          (anoAtual - anoCriado) * 12 + (mesAtualIdx - mesCriadoIdx);

        if (diffMeses < 0) return;
        if (diffMeses % intervalo !== 0) return;

        if (parcelas !== null) {
          const ordem = Math.floor(diffMeses / intervalo) + 1;
          if (ordem > parcelas) return;
        }

        // não duplica se já virou transaction
        const jaExiste = trans?.some((t) => {
          const p = String(t.quem || "").trim().toLowerCase();
          return (
            t.mes === mesDebug &&
            p === pessoa &&
            Number(t.valor) === valor
          );
        });
        if (jaExiste) return;

        total += valor;
      });

      return total;
    })();

    console.log("DEBUG FINAL Mar/26:", {
      somaTrans,
      somaBills,
      somaLoans,
      somaReservasAplicadas,
      totalCodigo: mapa[mesDebug],
      totalSomadoNoDebug:
        somaTrans + somaBills + somaLoans + somaReservasAplicadas,
    });

    setData(Object.values(mapa));
  }

  // ========= DERIVA DADOS PARA OS CARDS =========
  return (
  <div>
    <div style={{ marginBottom: 10 }}>
      <label>Ano:</label>
      <select
        value={ano}
        onChange={(e) => setAno(Number(e.target.value))}
      >
        {anos.map((y) => (
          <option key={y}>{y}</option>
        ))}
      </select>
    </div>

    {/* agora passamos os dados completos */}
    <AnnualSummaryCards data={data} />

    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip formatter={(v) => money(v)} />
        <Legend />
        <Line
          type="monotone"
          dataKey="amanda"
          name="Amanda"
          stroke="#A78BFA"
        />
        <Line
          type="monotone"
          dataKey="celso"
          name="Celso"
          stroke="#38BDF8"
        />
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
