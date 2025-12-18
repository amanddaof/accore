import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data }) {
  if (!data) return null;

  const { mesAtual, mesAnterior, variacao } = data;

  const subiu = variacao.valor > 0;
  const igual = variacao.valor === 0;

  return (
    <section className={`month-compare-card ${igual ? "neutral" : subiu ? "up" : "down"}`}>
      <header className="title">Comparativo mensal</header>

      <div className="months">
        <div>
          <span>{mesAtual.label}</span>
          <strong>{money(mesAtual.total)}</strong>
        </div>

        <div>
          <span>{mesAnterior.label}</span>
          <strong>{money(mesAnterior.total)}</strong>
        </div>
      </div>

      {igual && (
        <div className="variation neutral">
          Sem variação em relação ao mês passado
        </div>
      )}

      {!igual && (
        <div className="variation">
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(variacao.valor))}</strong>
          <span className="text">
            {subiu ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}
    </section>
  );
}
