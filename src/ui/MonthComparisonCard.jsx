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

  const { mesAtual, mesAnterior, total, porPessoa } = data;

  const subiu = total.valor > 0;
  const igual = total.valor === 0;

  const cardClass = [
    "month-compare-card",
    igual ? "neutral" : subiu ? "up" : "down"
  ].join(" ");

  function renderPessoa(nome, dados) {
    if (!dados) return null;

    const subiuPessoa = dados.valor > 0;
    const igualPessoa = dados.valor === 0;

    return (
      <div className={`person-compare ${igualPessoa ? "neutral" : subiuPessoa ? "up" : "down"}`}>
        <strong className="person-name">{nome}</strong>

        <div className="person-values">
          <span>{money(dados.atual)}</span>
          {!igualPessoa && (
            <small>
              {subiuPessoa ? "▲" : "▼"} {money(Math.abs(dados.valor))}
            </small>
          )}
          {igualPessoa && <small>sem variação</small>}
        </div>
      </div>
    );
  }

  return (
    <section className={cardClass}>
      <header className="title">Comparativo mensal</header>

      {/* =====================
          TOTAL GERAL
      ===================== */}
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

      {!igual && (
        <div className="variation">
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(total.valor))}</strong>
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

      {/* =====================
          POR PESSOA
      ===================== */}
      {porPessoa && (
        <div className="people-comparison">
          {renderPessoa("Amanda", porPessoa.amanda)}
          {renderPessoa("Celso", porPessoa.celso)}
        </div>
      )}
    </section>
  );
}
