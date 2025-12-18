import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data }) {
  if (!data) {
    return (
      <section className="month-compare-card neutral">
        <header className="title">Comparativo mensal</header>
        <div className="variation neutral">Carregando…</div>
      </section>
    );
  }

  const { mesAtual, mesAnterior, porPessoa } = data;

  function renderLinha(nome, info) {
    if (!info) return null;

    const subiu = info.valor > 0;
    const igual = info.valor === 0;

    return (
      <div className="person-compare">
        <strong>{nome}</strong>

        {igual && (
          <span className="neutral">sem variação</span>
        )}

        {!igual && (
          <span className={subiu ? "up" : "down"}>
            {subiu ? "▲" : "▼"} {money(Math.abs(info.valor))}
          </span>
        )}
      </div>
    );
  }

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      <div className="months-label">
        {mesAnterior} → {mesAtual}
      </div>

      <div className="people-variation">
        {renderLinha("Amanda", porPessoa.amanda)}
        {renderLinha("Celso", porPessoa.celso)}
      </div>
    </section>
  );
}
