import  money  from "../../../utils/money";
import { ordenarMes } from "../logica/ordenarMes";

export default function CardEmprestimo({
  descricao,
  parcelas,
  anoAtivo,
  pagarParcela
}) {

  const todas = [...parcelas].sort((a, b) =>
    ordenarMes(a.mes, b.mes)
  );

  const pagas = todas.filter(p => p.status === "Pago");
  const totalParcelas = todas.length;
  const progresso = totalParcelas
    ? Math.round((pagas.length / totalParcelas) * 100)
    : 0;

  const totalPago = pagas.reduce(
    (s, p) => s + Number(p.valor),
    0
  );

  const ultima = todas.at(-1);

  const filtradas = todas.filter(p =>
    anoAtivo === "todos" ||
    "20" + p.mes.split("/")[1] === anoAtivo
  );

  const porAno = filtradas.reduce((acc, p) => {
    const ano = "20" + p.mes.split("/")[1];
    if (!acc[ano]) acc[ano] = [];
    acc[ano].push(p);
    return acc;
  }, {});

  return (
    <div className="card-emprestimo">

      <div className="titulo-emprestimo">
        {descricao}
      </div>

      <div className="resumo-emprestimo">

  <div className="barra-progresso">
    <div
      className="barra-preenchida"
      style={{ width: `${progresso}%` }}
    />
  </div>

  <div className="dados-resumo">
    <div>
      <strong>{pagas.length} / {totalParcelas}</strong>
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

</div>


      <div className="anos-emprestimo">
        {Object.entries(porAno).map(([ano, lista]) => (
          <div key={ano} className="coluna-ano">

            <div className="titulo-ano">{ano}</div>

            {lista.map(p => (
              <div
                key={p.id}
                onClick={() =>
                  p.status !== "Pago" &&
                  pagarParcela(p.id)
                }
                className={`linha-parcela ${
                  p.status === "Pago" ? "parcela-paga" : ""
                }`}
              >
                <span>{p.mes}</span>
                <span>
                  {money(p.valor)}
                  {p.status === "Pago" &&
                    <span className="check"> ✓</span>}
                </span>
              </div>
            ))}

          </div>
        ))}
      </div>

    </div>
  );
}
