import { useEffect, useState } from "react";
import { getLoans, marcarParcelaComoPaga } from "../../services/loans.service";
import { money } from "../../utils/money";
import "./Loans.css";

export default function Loans() {

  const [anoAtivo, setAnoAtivo] = useState("todos");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    const data = await getLoans();
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function pagarParcela(id) {
    await marcarParcelaComoPaga(id);

    // atualiza estado local
    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: "Pago" } : r
      )
    );
  }

  if (loading) {
    return <div className="card glass">Carregando empréstimos...</div>;
  }

  // 🔹 agrupar por descrição
  const loans = rows.reduce((acc, row) => {
    if (!acc[row.descricao]) {
      acc[row.descricao] = {
        descricao: row.descricao,
        parcelas: [],
      };
    }
    acc[row.descricao].parcelas.push(row);
    return acc;
  }, {});

  // ✅ listar anos disponíveis
  const anosDisponiveis = [...new Set(
    rows.map(r => "20" + r.mes.split("/")[1])
  )].sort();

  return (
    <div className="card glass loans-page">

      <div className="loans-header">
        <h2>Empréstimos</h2>

        <div className="loan-filter">
          <select value={anoAtivo} onChange={e => setAnoAtivo(e.target.value)}>
            <option value="todos">Todos</option>
            {anosDisponiveis.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="loans-list">

        {Object.values(loans).map(loan => {

          const parcelasAno = loan.parcelas
            .filter(p => anoAtivo === "todos" || "20" + p.mes.split("/")[1] === anoAtivo)
            .sort((a, b) => ordenarMes(a.mes, b.mes));

          const todasParcelas = [...loan.parcelas].sort((a, b) => ordenarMes(a.mes, b.mes));

          const totalParcelas = todasParcelas.length;
          const pagasCount = todasParcelas.filter(p => p.status === "Pago").length;

          const progresso = totalParcelas
            ? Math.round((pagasCount / totalParcelas) * 100)
            : 0;

          const totalPago = todasParcelas
            .filter(p => p.status === "Pago")
            .reduce((s, p) => s + Number(p.valor), 0);

          const ultima = todasParcelas.at(-1);

          const parcelasPorAno = parcelasAno.reduce((acc, p) => {
            const ano = "20" + p.mes.split("/")[1];
            if (!acc[ano]) acc[ano] = [];
            acc[ano].push(p);
            return acc;
          }, {});

          return (
            <div key={loan.descricao} className="loan-card">

              <div className="loan-title">{loan.descricao}</div>

              {/* 📊 Resumo */}
              <div className="loan-summary">

                <div className="loan-progress">
                  <div
                    className="loan-progress-fill"
                    style={{ width: `${progresso}%` }}
                  />
                </div>

                <div>
                  <strong>{pagasCount} / {totalParcelas}</strong>
                  <small>Parcelas pagas</small>
                </div>

                <div>
                  <strong>{money(totalPago)}</strong>
                  <small>Total pago</small>
                </div>

                <div>
                  <strong>{ultima?.mes}</strong>
                  <small>Última parcela</small>
                </div>

              </div>

              {/* 📆 COLUNAS POR ANO */}
              <div className="loan-years">

                {Object.entries(parcelasPorAno).map(([ano, lista]) => (

                  <div key={ano} className="loan-year-column">

                    <div className="loan-year-title">{ano}</div>

                    {lista.map(p => (
                      <div
                        key={p.id}
                        onClick={() => p.status !== "Pago" && pagarParcela(p.id)}
                        className={`loan-row ${p.status === "Pago" ? "parcela-paga" : ""}`}
                      >
                        <span>{p.mes}</span>
                        <span>
                          {money(p.valor)}
                          {p.status === "Pago" && <span className="check"> ✓</span>}
                        </span>
                      </div>
                    ))}

                  </div>

                ))}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}


// ✅ ordenação cronológica
function ordenarMes(a, b) {
  return parseMes(a) - parseMes(b);
}

function parseMes(texto) {
  const meses = {
    Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
    Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11
  };

  const [mes, ano] = texto.split("/");
  const anoCompleto = 2000 + Number(ano);
  return new Date(anoCompleto, meses[mes], 1).getTime();
}
