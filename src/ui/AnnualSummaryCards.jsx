import { useState } from "react";
import { money } from "../utils/money";
import "./AnnualSummaryCards.css";

export default function AnnualSummaryCards({ data = [] }) {
  const [view, setView] = useState("total"); // "total" | "amanda" | "celso"

  if (!data || data.length === 0) return null;

  const label =
    view === "total" ? "Total" : view === "amanda" ? "Amanda" : "Celso";

  const monthlyTotals = data.map((d) => ({
    mes: String(d.mes).split("/")[0], // "Jan/25" -> "Jan"
    valor: Number(
      view === "amanda"
        ? d.amanda || 0
        : view === "celso"
        ? d.celso || 0
        : d.total || 0
    ),
  }));

  const total = monthlyTotals.reduce((s, m) => s + Number(m.valor || 0), 0);
  const media = total / monthlyTotals.length;

  const melhor = monthlyTotals.reduce(
    (min, cur) => (cur.valor < min.valor ? cur : min),
    monthlyTotals[0]
  );

  const pior = monthlyTotals.reduce(
    (max, cur) => (cur.valor > max.valor ? cur : max),
    monthlyTotals[0]
  );

  return (
    <div className="annual-summary-wrapper">
      <div className="annual-summary-header">
        <span className="summary-title">Resumo anual</span>

        <div className="annual-summary-toggle">
          <button
            className={`chip ${view === "total" ? "active" : ""}`}
            onClick={() => setView("total")}
          >
            Total
          </button>
          <button
            className={`chip ${view === "amanda" ? "active" : ""}`}
            onClick={() => setView("amanda")}
          >
            Amanda
          </button>
          <button
            className={`chip ${view === "celso" ? "active" : ""}`}
            onClick={() => setView("celso")}
          >
            Celso
          </button>
        </div>
      </div>

      <div className="annual-summary-cards">
        <div className="card total">
          <span>Total anual — {label}</span>
          <strong>{money(total)}</strong>
        </div>

        <div className="card media">
          <span>Média mensal — {label}</span>
          <strong>{money(media)}</strong>
        </div>

        <div className="card melhor">
          <span>Melhor mês — {label}</span>
          <strong>
            {melhor.mes} — {money(melhor.valor)}
          </strong>
        </div>

        <div className="card pior">
          <span>Pior mês — {label}</span>
          <strong>
            {pior.mes} — {money(pior.valor)}
          </strong>
        </div>
      </div>
    </div>
  );
}
