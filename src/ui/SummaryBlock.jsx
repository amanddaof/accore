export default function SummaryBlock({ mensal, dividas }) {

  const [a, c] = mensal.porPessoa;

  return (
    <div className="grid grid-4">

      <Box title="TOTAL" value={`R$ ${mensal.total.toFixed(2)}`} highlight />

      <Box title="AMANDA" value={`R$ ${a.total.toFixed(2)}`} />

      <Box title="CELSO" value={`R$ ${c.total.toFixed(2)}`} />

      <Box
        title="DÍVIDA"
        value={
          dividas.devedor
            ? `${dividas.devedor} → ${dividas.credor}`
            : "Tudo certo"
        }
        sub={dividas.valor ? `R$ ${dividas.valor.toFixed(2)}` : null}
        danger={dividas.valor > 0}
      />

    </div>
  );
}


function Box({ title, value, sub, highlight, danger }) {
  return (
    <div className={`glass card ${danger ? "danger" : ""}`}>
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {sub && <small>{sub}</small>}
    </div>
  );
}
