import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data }) {
  // =====================
  // Estado inicial / carregando
  // =====================
  if (!data) {
    return (
      <section className="month-compare-card neutral">
        <header className="title">Comparativo mensal</header>

        <div className="months">
          <div>
            <span>—</span>
            <strong>R$ —</strong>
          </div>

          <div>
            <span>—</span>
            <strong>R$ —</strong>
          </div>
        </div>

        <div className="variation neutral">
          Carregando comparativo…
        </div>
      </section>
    );
  }

  const { mesAtual, mesAnterior, variacao } = data;

  const subiu = variacao.valor > 0;
  const igual = variacao.valor === 0;

  const cardClass = [
    "month-compare-card",
    igual ? "neutral" : subiu ? "up" : "down"
  ].join(" ");

  return (
    <section className={cardClass}>
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

      {!igual && (
        <div className="variation">
          <span className="arrow">{subiu ? "▲" : "▼"}</span>

          <strong>{money(Math.abs(variacao.valor))}</strong>

          <span className="text">
            {subiu ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}

      {igual && (
        <div className="variation neutral">
          Sem variação em relação ao mês passado
        </div>
      )}
    </section>
  );
}
