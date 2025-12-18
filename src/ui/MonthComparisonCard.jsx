import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data }) {
  if (!data) return null;

  // 🔒 DEFENSIVO: garante que nada quebre
  const mesAtual =
    typeof data.mesAtual === "string"
      ? data.mesAtual
      : data.mesAtual?.label;

  const mesAnterior =
    typeof data.mesAnterior === "string"
      ? data.mesAnterior
      : data.mesAnterior?.label;

  const total = data.total || {
    atual: 0,
    anterior: 0,
    valor: 0
  };

  const porPessoa = data.porPessoa || null;

  const subiuTotal = total.valor > 0;
  const igualTotal = total.valor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* ================= TOTAL ================= */}
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

      {/* ============== POR PESSOA (OPCIONAL) ============== */}
      {porPessoa && (
        <div className="people-variation">
          <div>
            <strong>Amanda</strong>{" "}
            {porPessoa.amanda?.valor === 0
              ? "sem variação"
              : money(porPessoa.amanda?.valor || 0)}
          </div>

          <div>
            <strong>Celso</strong>{" "}
            {porPessoa.celso?.valor === 0
              ? "sem variação"
              : money(porPessoa.celso?.valor || 0)}
          </div>
        </div>
      )}
    </section>
  );
}
