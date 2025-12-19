import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonByPersonCard({
  data,
  mesAtualLabel,
  mesAnteriorLabel
}) {
  if (!data) return null;

  const { amanda, celso } = data;

  const renderLinha = (nome, info) => {
    const subiu = info.valor > 0;
    const igual = info.valor === 0;

    return (
      <div className="person-block">
        <header className="person-name">{nome}</header>

        <div className="months">
          <div>
            <span>{mesAtualLabel}</span>
            <strong>{money(info.atual)}</strong>
          </div>

          <div>
            <span>{mesAnteriorLabel}</span>
            <strong>{money(info.anterior)}</strong>
          </div>
        </div>

        {igual ? (
          <div className="variation neutral">
            Sem variação em relação ao mês passado
          </div>
        ) : (
          <div className="variation">
            <span className="arrow">{subiu ? "▲" : "▼"}</span>
            <strong>{money(Math.abs(info.valor))}</strong>
            <span className="text">
              {subiu ? "a mais" : "a menos"} que no mês passado
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal por pessoa</header>

      <div className="people-compare">
        {renderLinha("Amanda", amanda)}
        {renderLinha("Celso", celso)}
      </div>
    </section>
  );
}
