// ui/LoansSummary.jsx
import { isoParaMesAbrev } from "../core/dates";

export default function LoansSummary({ loans = [], mes }) {
  if (!loans.length || !mes) return null;

  const mesFiltro = isoParaMesAbrev(mes);

  // converte "Dez/25" para timestamp
  function parseMesAbr(mesStr) {
    const meses = {
      Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
      Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11
    };

    const [m, a] = mesStr.split("/");
    return new Date(2000 + Number(a), meses[m]).getTime();
  }

  const filtroTime = parseMesAbr(mesFiltro);

  // agrupar parcelas por descrição do empréstimo
  const agrupados = loans.reduce((acc, loan) => {
    const nome = loan.descricao;

    if (!acc[nome]) {
      acc[nome] = {
        nome,
        total: 0,
        pagas: 0,
        valorParcela: Number(loan.valor) || 0
      };
    }

    acc[nome].total += 1;

    // parcela é considerada paga se o mês dela é ANTERIOR ao mês filtrado
    const parcelaTime = parseMesAbr(loan.mes);
    if (parcelaTime < filtroTime) {
      acc[nome].pagas += 1;
    }

    return acc;
  }, {});

  const lista = Object.values(agrupados);

  return (
    <div className="home-card loan-highlight">
      <header className="section-title">Empréstimos</header>

      {lista.map((l) => {
        const faltam = l.total - l.pagas;
        const progresso =
          l.total > 0 ? Math.min(100, Math.floor((l.pagas / l.total) * 100)) : 0;

        return (
          <div key={l.nome} className="loan-resume">
            <div className="loan-head">
              <strong>{l.nome}</strong>
              <span>R$ {l.valorParcela.toFixed(2)}</span>
            </div>

            <div className="loan-meta">
              {l.pagas} / {l.total} parcelas pagas
            </div>

            {/* 🔵 BARRA INLINE (independente de CSS) */}
            <div
              style={{
                width: "100%",
                height: 7,
                borderRadius: 999,
                background: "rgba(255,255,255,.08)",
                overflow: "hidden",
                margin: "8px 0 6px",
                boxShadow: "inset 0 0 4px rgba(0,0,0,.7)"
              }}
            >
              <div
                style={{
                  width: `${progresso}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg,#c9a24d,#9a7a2f)",
                  boxShadow: "0 0 6px rgba(201,162,77,.45)",
                  transition: "width .35s cubic-bezier(.4,0,.2,1)"
                }}
              />
            </div>

            <div className="loan-foot">
              Faltam {faltam} {faltam === 1 ? "parcela" : "parcelas"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
