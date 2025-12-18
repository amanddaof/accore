import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data }) {
  // Se não tem nada, não renderiza
  if (!data) return null;

  // Aceita os dois formatos (defensivo)
  const mesAtual = data.mesAtual?.label ?? data.mesAtual ?? "";
  const mesAnterior = data.mesAnterior?.label ?? data.mesAnterior ?? "";

  // PRIORIDADE: comparativo TOTAL (o que já funcionava)
  const totalAtual = data.mesAtual?.total ?? data.total?.atual ?? 0;
  const totalAnterior = data.mesAnterior?.total ?? data.total?.anterior ?? 0;

  const valor =
    data.variacao?.valor ??
    (typeof totalAtual === "number" && typeof totalAnterior === "number"
      ? totalAtual - totalAnterior
      : 0);

  const subiu = valor > 0;
  const igual = valor === 0;

  return (
    <section
      className={`month-compare-card ${
        igual ? "neutral" : subiu ? "up" : "down"
      }`}
    >
      <header className="title">Comparativo mensal</header>

      {/* TOTAL */}
      <div className="months">
        <div>
          <span>{mesAtual}</span>
          <strong>{money(totalAtual)}</strong>
        </div>

        <div>
          <span>{mesAnterior}</span>
          <strong>{money(totalAnterior)}</strong>
        </div>
      </div>

      {igual ? (
        <div className="variation neutral">
          Sem variação em relação ao mês passado
        </div>
      ) : (
        <div className="variation">
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(valor))}</strong>
          <span className="text">
            {subiu ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}
    </section>
  );
}
