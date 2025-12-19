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
  porPessoa,
  periodo = "mensal",
  onChangePeriodo
}) {
  if (!data) return null;

  const { mesAtual, mesAnterior, variacao } = data;

  const subiu = variacao?.valor > 0;
  const igual = variacao?.valor === 0;

  const titulo =
    periodo === "mensal"
      ? "Comparativo mensal"
      : `Comparativo vs média ${periodo.replace("media", "")} meses`;

  return (
    <section className="month-compare-card">
      <header className="title">{titulo}</header>

      {/* ===================== TABS ===================== */}
      <div className="compare-tabs">
        {[
          { key: "mensal", label: "Mês" },
          { key: "media3", label: "3m" },
          { key: "media6", label: "6m" },
          { key: "media12", label: "12m" }
        ].map(t => (
          <button
            key={t.key}
            className={periodo === t.key ? "active" : ""}
            onClick={() => onChangePeriodo?.(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===================== TOTAL ===================== */}
      <div className="months">
        <div>
          <span>{formatarMes(mesAtual?.label)}</span>
          <strong>{money(mesAtual?.total || 0)}</strong>
        </div>

        <div>
          <span>
            {periodo === "mensal"
              ? formatarMes(mesAnterior?.label)
              : "Média"}
          </span>
          <strong>{money(mesAnterior?.total || mesAnterior?.media || 0)}</strong>
        </div>
      </div>

      {/* ===================== VARIAÇÃO TOTAL ===================== */}
      {igual ? (
        <div className="variation neutral">
          Sem variação em relação ao período anterior
        </div>
      ) : (
        <div className={`variation ${subiu ? "up" : "down"}`}>
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(variacao.valor))}</strong>
          <span className="text">
            {subiu ? "a mais" : "a menos"} que{" "}
            {periodo === "mensal" ? "no mês passado" : "a média"}
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
                    <span>
                      {periodo === "mensal" ? "Anterior" : "Média"}
                    </span>
                    <strong>{money(info.anterior || info.media || 0)}</strong>
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
