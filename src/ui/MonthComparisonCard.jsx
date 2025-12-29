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
   ADAPTA OS DADOS RECEBIDOS DO HOME
   (transforma total[] → mesAtual/mesAnterior/variacao)
====================================================== */
function normalizarEntrada(data, porPessoa) {
  if (!Array.isArray(data) || data.length < 2) return null;

  const mesAnterior = data[0];
  const mesAtual = data[1];

  const anteriorValor = mesAnterior.total ?? mesAnterior.valor ?? 0;
  const atualValor = mesAtual.total ?? mesAtual.valor ?? 0;

  const variacaoValor = atualValor - anteriorValor;

  // adapta por pessoa
  let porPessoaAdaptado = null;
  if (porPessoa) {
    porPessoaAdaptado = {};

    for (const key of ["amanda", "celso"]) {
      const info = porPessoa[key];
      if (!info) continue;

      porPessoaAdaptado[key] = {
        anterior: info.anterior?.total ?? info.anterior?.valor ?? 0,
        atual: info.atual?.total ?? info.atual?.valor ?? 0,
        valor: (info.atual?.total ?? info.atual?.valor ?? 0) -
               (info.anterior?.total ?? info.anterior?.valor ?? 0)
      };
    }
  }

  return {
    mesAnterior: {
      label: mesAnterior.label,
      total: anteriorValor
    },
    mesAtual: {
      label: mesAtual.label,
      total: atualValor
    },
    variacao: {
      valor: variacaoValor
    },
    porPessoa: porPessoaAdaptado
  };
}

export default function MonthComparisonCard({
  data,
  porPessoa
}) {
  const normalizado = normalizarEntrada(data, porPessoa);

  if (!normalizado) return null;

  const { mesAtual, mesAnterior, variacao, porPessoa: pessoas } = normalizado;

  const subiu = variacao.valor > 0;
  const igual = variacao.valor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      {/* ===================== TOTAL ===================== */}
      <div className="months">
        <div>
          <span>{formatarMes(mesAtual.label)}</span>
          <strong>{money(mesAtual.total)}</strong>
        </div>

        <div>
          <span>{formatarMes(mesAnterior.label)}</span>
          <strong>{money(mesAnterior.total)}</strong>
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
      {pessoas && (
        <div className="people-compare-inline">
          {["amanda", "celso"].map(key => {
            const nome = key === "amanda" ? "Amanda" : "Celso";
            const info = pessoas[key];
            if (!info) return null;

            const sub = info.valor > 0;
            const eq = info.valor === 0;

            return (
              <div key={key} className="person-block">
                <header className="person-name">{nome}</header>

                <div className="months small">
                  <div>
                    <span>{formatarMes(mesAtual.label)}</span>
                    <strong>{money(info.atual)}</strong>
                  </div>

                  <div>
                    <span>{formatarMes(mesAnterior.label)}</span>
                    <strong>{money(info.anterior)}</strong>
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
