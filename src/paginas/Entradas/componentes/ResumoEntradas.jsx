export default function ResumoEntradas({
  totalVenda,
  totalRecebido,
  falta,
  percentual,
  concluido,
}) {
  return (
    <div className="resumo-entradas">
      <div className="linha-resumo">
        <div>
          <small>Total da venda</small>
          <strong>R$ {totalVenda.toFixed(2)}</strong>
        </div>

        <div>
          <small>Recebido</small>
          <strong>R$ {totalRecebido.toFixed(2)}</strong>
        </div>

        <div>
          <small>
            {concluido ? "Concluído" : "Falta receber"}
          </small>
          <strong
            className={
              concluido ? "valor-ok" : "valor-pendente"
            }
          >
            {concluido
              ? "Venda concluída"
              : `R$ ${falta.toFixed(2)}`}
          </strong>
        </div>
      </div>

      <div className="barra-externa">
        <div
          className="barra-interna"
          style={{
            width: `${Math.min(percentual, 100)}%`,
          }}
        />
      </div>

      <div className="percentual">
        {percentual}% recebido
      </div>
    </div>
  );
}
