import money from "../../../utils/money";
import { formatDateLabel } from "../../../utils/formatDate";

export default function ListaExterno({
  transacoes,
  onEditar,
  onExcluir,
  onMarcarPago
}) {

  function agruparPorData(lista) {
    return lista.reduce((acc, transacao) => {
      const chave = transacao.data_real || "SEM_DATA";
      if (!acc[chave]) acc[chave] = [];
      acc[chave].push(transacao);
      return acc;
    }, {});
  }

  const pendentes = transacoes.filter(t => t.status === "Pendente");
  const pagas = transacoes.filter(t => t.status === "Pago");

  const pendentesAgrupados = agruparPorData(pendentes);
  const pagasAgrupados = agruparPorData(pagas);

  return (
    <>
      {/* PENDENTES */}
      <div className="lista-bloco">
        <h4>Pendentes</h4>

        {Object.entries(pendentesAgrupados).map(([data, lista]) => (
          <div key={data} className="grupo-dia">
            <div className="grupo-data">
              {formatDateLabel(data)}
            </div>

            {lista.map(t => (
              <div key={t.id} className="linha-transacao pendente">
                <div className="info-esquerda">
                  <strong>{t.descricao}</strong>
                  <div className="linha-secundaria">
                    <div className="linha-secundaria">
                    <span>{t.parcelas}</span>

                    <span
                      className={`badge-pessoa ${
                        t.quem === "Amanda"
                          ? "amanda"
                          : t.quem === "Celso"
                          ? "celso"
                          : "ambos"
                      }`}
                    >
                      {t.quem}
                    </span>

                    <span className="paga-info">
                      Paga: {t.quem_paga}
                    </span>
                  </div>
                  </div>
                </div>

                <div className="lado-direito">
                  <span className="valor">{money(t.valor)}</span>

                  <div className="acoes">
                    <img
                      src="/icone/verificar.png"
                      alt="Marcar como pago"
                      onClick={() => onMarcarPago(t.id)}
                    />
                    <img
                      src="/icone/editar.png"
                      alt="Editar"
                      onClick={() => onEditar(t)}
                    />
                    <img
                      src="/icone/excluir.png"
                      alt="Excluir"
                      onClick={() => onExcluir(t)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* PAGAS */}
      {pagas.length > 0 && (
        <div className="lista-bloco pagas">
          <h4>Pagas</h4>

          {Object.entries(pagasAgrupados).map(([data, lista]) => (
            <div key={data} className="grupo-dia">
              <div className="grupo-data">
                {formatDateLabel(data)}
              </div>

              {lista.map(t => (
                <div key={t.id} className="linha-transacao paga">
                  <div className="info-esquerda">
                    <strong>{t.descricao}</strong>
                    <div className="linha-secundaria">
                      <span>
                        {t.parcelas} • {t.quem} • Paga: {t.quem_paga}
                      </span>
                    </div>
                  </div>

                  <div className="lado-direito">
                    <span className="valor">{money(t.valor)}</span>

                    <div className="acoes">
                      <img
                        src="/icone/editar.png"
                        alt="Editar"
                        onClick={() => onEditar(t)}
                      />
                      <img
                        src="/icone/excluir.png"
                        alt="Excluir"
                        onClick={() => onExcluir(t)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
