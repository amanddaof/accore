import { money } from "../utils/money";
import "./MonthComparisonCard.css";

/* ======================================================
   YYYY-MM → Dez/25
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

/* ======================================================
   COMPONENTE PRINCIPAL — COMPATÍVEL COM O SEU HOME
====================================================== */
export default function MonthComparisonCard({ data, porPessoa }) {
  if (!Array.isArray(data) || data.length < 2) return null;

  const mesAnterior = data[0];
  const mesAtual = data[1];

  // garante número
  const anteriorValor = mesAnterior?.total ?? mesAnterior?.valor ?? 0;
  const atualValor = mesAtual?.total ?? mesAtual?.valor ?? 0;

  const variacao = atualValor - anteriorValor;
  const subiu = variacao > 0;
  const igual = variacao === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* ===================== TOTAL ===================== */}
      <div className="months">
        <div>
          <span>{formatarMes(mesAtual?.label)}</span>
          <strong>{money(atualValor)}</strong>
        </div>

        <div>
          <span>{formatarMes(mesAnterior?.label)}</span>
          <strong>{money(anteriorValor)}</strong>
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
          <strong>{money(Math.abs(variacao))}</strong>
          <span className="text">
            {subiu ? "a mais" : "a menos"} que no mês passado
          </span>
        </div>
      )}

      {/* ===================== POR PESSOA ===================== */}
      {porPessoa && (
        <div className="people-compare-inline">
          {Object.entries(porPessoa).map(([key, info]) => {
            if (!info) return null;

            const nome = key === "amanda" ? "Amanda" : "Celso";

            const anterior = info.anterior?.total ?? info.anterior?.valor ?? 0;
            const atual = info.atual?.total ?? info.atual?.valor ?? 0;
            const diff = atual - anterior;

            const sub = diff > 0;
            const eq = diff === 0;

            return (
              <div key={key} className="person-block">
                <header className="person-name">{nome}</header>

                <div className="months small">
                  <div>
                    <span>{formatarMes(mesAtual?.label)}</span>
                    <strong>{money(atual)}</strong>
                  </div>

                  <div>
                    <span>{formatarMes(mesAnterior?.label)}</span>
                    <strong>{money(anterior)}</strong>
                  </div>
                </div>

                {eq ? (
                  <div className="variation neutral tiny">
                    Sem variação
                  </div>
                ) : (
                  <div className={`variation tiny ${sub ? "up" : "down"}`}>
                    <span className="arrow">{sub ? "▲" : "▼"}</span>
                    <strong>{money(Math.abs(diff))}</strong>
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
