import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data }) {
  if (!data) return null;

  const { mesAtual, mesAnterior, total, porPessoa } = data;

  const subiuTotal = total.valor > 0;
  const igualTotal = total.valor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* TOTAL */}
      <div className="months">
        <div>
          <span>{mesAtual}</span>
          <strong>{money(total.atual)}</strong>
        </div>

        <div>
          <span>{mesAnterior}</span>
          <strong>{money(total.anterior)}</strong>
        </div>
      </div>

      {igualTotal && (
        <div className="variation neutral">
          Sem variação em relação ao mês passado
        </div>
      )}

      {!igualTotal && (
        <div className="variation">
          <span className="arrow">{subiuTotal ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(total.valor))}</strong>
          <span className="text">
            {subiuTotal ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}

      {/* POR PESSOA */}
      <div className="people-variation">
        <div>
          <strong>Amanda</strong>{" "}
          {porPessoa.amanda.valor === 0
            ? "sem variação"
            : money(porPessoa.amanda.valor)}
        </div>

        <div>
          <strong>Celso</strong>{" "}
          {porPessoa.celso.valor === 0
            ? "sem variação"
            : money(porPessoa.celso.valor)}
        </div>
      </div>
    </section>
  );
}
