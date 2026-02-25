import { useState } from "react";
import money from "../../../utils/money";

export default function LinhaReserva({
  reserva,
  aoProcessar,
  aoEditar,
  aoExcluir
}) {

  const [aberto, setAberto] = useState(false);

  function classeBadge(pessoa) {
    if (!pessoa) return "";
    return `badge-${pessoa.toLowerCase()}`;
  }

  return (
    <>
      <div
        className="linha-reserva"
        onClick={() => setAberto(v => !v)}
      >
        <div>
          <div className="data-reserva">
            {reserva.data_real}
          </div>

          <strong>{reserva.descricao}</strong>
        </div>

        <div className="lado-direito-reserva">
          {reserva.quem && (
            <div className={classeBadge(reserva.quem)}>
              {reserva.quem}
            </div>
          )}

          <strong className="valor-reserva">
            {money(reserva.valor)}
          </strong>
        </div>
      </div>

      {aberto && (
        <div className="detalhe-reserva">

          <div className="linha-info">
            <span>Origem</span>
            <strong>{reserva.origem}</strong>
          </div>

          <div className="linha-info">
            <span>Recorrência</span>
            <strong>{reserva.recorrencia}</strong>
          </div>

          <div className="linha-info">
            <span>Mês</span>
            <strong>{reserva.mes}</strong>
          </div>

          <div className="acoes-reserva">

            <button
              className="btn-secundario-reserva"
              onClick={(e) => {
                e.stopPropagation();
                aoProcessar(reserva);
              }}
            >
              ✓ Processar
            </button>

            <div className="acoes-icones">

              <img
                src="/icone/editar.png"
                alt="Editar"
                onClick={(e) => {
                  e.stopPropagation();
                  aoEditar(reserva);
                }}
              />

              <img
                src="/icone/excluir.png"
                alt="Excluir"
                onClick={(e) => {
                  e.stopPropagation();
                  aoExcluir(reserva);
                }}
              />

            </div>

          </div>

        </div>
      )}
    </>
  );
}