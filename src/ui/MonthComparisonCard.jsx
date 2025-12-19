import { money } from "../utils/money";
import "./MonthComparisonCard.css";

export default function MonthComparisonCard({ data, porPessoa }) {
  if (!data) return null;

  const { mesAtual, mesAnterior, variacao } = data;
  const subiu = variacao.valor > 0;
  const igual = variacao.valor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* TOTAL */}
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

      {igual ? (
        <div className="variation neutral">
          Sem variação em relação ao mês passado
        </div>
      ) : (
        <div className="variation">
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(variacao.valor))}</strong>
          <span className="text">
            {subiu ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}

      {/* POR PESSOA DENTRO DO MESMO CARD */}
      {porPessoa && (
        <div className="people-compare-inline">
          {["amanda", "celso"].map(key => {
            const nome = key === "amanda" ? "Amanda" : "Celso";
            const info = porPessoa[key];
            if (!info) return null;

            const sub = info.valor > 0;
            const eq = info.valor === 0;

            return (
              <div key={key} className="person-block">
                <header className="person-name">{nome}</header>

                <div className="months small">
                  <div>
                    <span>{mesAtual.label}</span>
                    <strong>{money(info.atual)}</strong>
                  </div>

                  <div>
                    <span>{mesAnterior.label}</span>
                    <strong>{money(info.anterior)}</strong>
                  </div>
                </div>

                {eq ? (
                  <div className="variation neutral tiny">
                    Sem variação
                  </div>
                ) : (
                  <div className="variation tiny">
                    <span className="arrow">{sub ? "▲" : "▼"}</span>
                    <strong>{money(Math.abs(info.valor))}</strong>
                    <span className="text">
                      {sub ? "a mais" : "a menos"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
