import { money } from "../utils/money";
import "./MonthComparisonCard.css";

/* ======================================================
   Utilitário visual: YYYY-MM → Dez/25
====================================================== */
function formatarMes(label) {
  if (!label || !label.includes("-")) return label;

  const [ano, mes] = label.split("-");
  const meses = [
    "Jan","Fev","Mar","Abr","Mai","Jun",
    "Jul","Ago","Set","Out","Nov","Dez"
  ];

  return `${meses[Number(mes) - 1]}/${ano.slice(2)}`;
}

export default function MonthComparisonCard({
  data,
  porPessoa
}) {
  if (!data) return null;

  const { mesAtual, mesAnterior, variacao } = data;

  const subiu = variacao?.valor > 0;
  const igual = variacao?.valor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* ===================== TOTAL ===================== */}
      <div className="months">
        <div>
          <span>{formatarMes(mesAtual?.label)}</span>
          <strong>{money(mesAtual?.total || 0)}</strong>
        </div>

        <div>
          <span>{formatarMes(mesAnterior?.label)}</span>
          <strong>{money(mesAnterior?.total || 0)}</strong>
        </div>
      </div>

      {/* ===================== VARIAÇÃO TOTAL ===================== */}
      {igual ? (
        <div className="variation neutral">
          Sem variação em relação ao mês passado
        </div>
      ) : (
        <div className={`variation ${subiu ? "up" : "down"}`}>
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(variacao.valor))}</strong>
          <span className="text">
            {subiu ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}

      {/* ===================== POR PESSOA ===================== */}
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
                    <span>{formatarMes(mesAtual?.label)}</span>
                    <strong>{money(info.atual || 0)}</strong>
                  </div>

                  <div>
                    <span>{formatarMes(mesAnterior?.label)}</span>
                    <strong>{money(info.anterior || 0)}</strong>
                  </div>
                </div>

                {eq ? (
                  <div className="variation neutral tiny">
                    Sem variação
                  </div>
                ) : (
                  <div className={`variation tiny ${sub ? "up" : "down"}`}>
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
