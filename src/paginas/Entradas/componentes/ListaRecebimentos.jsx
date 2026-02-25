export default function ListaRecebimentos({
  recebimentos,
}) {
  return (
    <div className="lista-recebimentos">
      <h3>Recebimentos registrados</h3>

      {recebimentos.map((r) => (
        <div key={r.id} className="linha-recebimento">
          <span>{r.mes}</span>
          <strong>
            R$ {Number(r.valor).toFixed(2)}
          </strong>
        </div>
      ))}
    </div>
  );
}
