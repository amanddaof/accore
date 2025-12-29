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

export default function MonthComparisonCard({ 
  mesAnterior, 
  mesAtual, 
  variacao, 
  porPessoa 
}) {
  // ✅ NOVO: aceita tanto objeto quanto array
  let anteriorData, atualData;
  
  if (Array.isArray(mesAnterior)) {
    // Formato antigo: data={[anterior, atual]}
    [anteriorData, atualData] = mesAnterior;
  } else {
    // ✅ NOVO: formato do seu Home atual
    anteriorData = mesAnterior;
    atualData = mesAtual;
  }

  const anteriorValor = Number(anteriorData?.total ?? anteriorData?.valor ?? 0);
  const atualValor = Number(atualData?.total ?? atualData?.valor ?? 0);
  const diffValor = Number(variacao?.valor ?? (atualValor - anteriorValor));

  const subiu = diffValor > 0;
  const igual = diffValor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* ===================== TOTAL ===================== */}
      <div className="months">
        <div>
          <span>{formatarMes(atualData?.label)}</span>
          <strong>{money(atualValor)}</strong>
        </div>

        <div>
          <span>{formatarMes(anteriorData?.label)}</span>
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
          <strong>{money(Math.abs(diffValor))}</strong>
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
            const anterior = Number(info.anterior?.total ?? info.anterior?.valor ?? 0);
            const atual = Number(info.atual?.total ?? info.atual?.valor ?? 0);
            const diff = atual - anterior;
            const sub = diff > 0;
            const eq = diff === 0;

            return (
              <div key={key} className="person-block">
                <header className="person-name">{nome}</header>

                <div className="months small">
                  <div>
                    <span>{formatarMes(atualData?.label)}</span>
                    <strong>{money(atual)}</strong>
                  </div>
                  <div>
                    <span>{formatarMes(anteriorData?.label)}</span>
                    <strong>{money(anterior)}</strong>
                  </div>
                </div>

                {eq ? (
                  <div className="variation neutral tiny">Sem variação</div>
                ) : (
                  <div className={`variation tiny ${sub ? "up" : "down"}`}>
                    <span className="arrow">{sub ? "▲" : "▼"}</span>
                    <strong>{money(Math.abs(diff))}</strong>
                    <span className="text">{sub ? "a mais" : "a menos"}</span>
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
