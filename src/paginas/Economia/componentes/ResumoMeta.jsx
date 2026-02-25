import money from "../../../utils/money";

export default function ResumoMeta({
  meta,
  totalGuardado,
  totalAmanda,
  totalCelso,
  statusMeta,
  abrirModalMeta
}) {

  const valorMeta = meta?.valor || 0;

  const percentual = valorMeta
    ? Math.min((totalGuardado / valorMeta) * 100, 100)
    : 0;

  let corBarra = "#8B5CF6";

  if (percentual >= 100) {
    corBarra = "#5EEAD4";
  } else if (percentual >= 75) {
    corBarra = "#7AA2F7";
  }

  const falta = valorMeta - totalGuardado;

  let mensagemStatus = null;
  let mensagemRitmo = null;
  let mensagemProjecao = null;

  if (valorMeta > 0 && statusMeta) {

    if (statusMeta.tipo === "passado") {
      mensagemStatus = statusMeta.vaiBaterMeta
        ? "Meta atingida 🎯"
        : "Meta não foi atingida";
    }

    if (statusMeta.tipo === "atual") {

      mensagemStatus = statusMeta.vaiBaterMeta
        ? "Projeção indica que você baterá a meta 🎯"
        : "Mantendo o ritmo atual, a meta não será atingida";

      mensagemProjecao = `Projeção anual: ${money(statusMeta.projecao)}`;

      if (statusMeta.ritmo === "acima") {
        mensagemRitmo = "Você está acima do ritmo ideal 🚀";
      }

      if (statusMeta.ritmo === "abaixo") {
        mensagemRitmo = "Você está abaixo do ritmo ideal ⚠️";
      }

      if (statusMeta.ritmo === "no-ritmo") {
        mensagemRitmo = "Você está exatamente no ritmo esperado";
      }
    }

    if (statusMeta.tipo === "atual-sem-dados") {
      mensagemStatus =
        "Aguardando fechamento do primeiro mês para projeção";
    }
  }

  return (
    <div className="resumo-meta">

      <div className="resumo-topo">
        <h2>Meta Anual</h2>
        <button
          onClick={abrirModalMeta}
          className="botao-secundario"
        >
          {meta ? "Editar Meta" : "Definir Meta"}
        </button>
      </div>

      <div className="resumo-numeros">

        <div>
          <span className="label">Meta</span>
          <span className="valor">{money(valorMeta)}</span>
        </div>

        <div>
          <span className="label">Guardado</span>
          <span className="valor">{money(totalGuardado)}</span>
        </div>

        <div>
          <span className="label">Amanda</span>
          <span className="valor">{money(totalAmanda)}</span>
        </div>

        <div>
          <span className="label">Celso</span>
          <span className="valor">{money(totalCelso)}</span>
        </div>

        <div>
          <span className="label">Faltam</span>
          <span className="valor">
            {valorMeta ? money(Math.max(falta, 0)) : "—"}
          </span>
        </div>

      </div>

      <div className="barra-progresso">
        <div
          className="barra-preenchida"
          style={{
            width: `${percentual}%`,
            background: corBarra
          }}
        />
      </div>

      <div className="percentual">
        {valorMeta
          ? `${percentual.toFixed(1)}% atingido`
          : "Sem meta definida"}
      </div>

      {mensagemProjecao && (
        <div className="info-projecao">
          {mensagemProjecao}
        </div>
      )}

      {mensagemRitmo && (
        <div className="info-ritmo">
          {mensagemRitmo}
        </div>
      )}

      {mensagemStatus && (
        <div
          className={`status-meta ${
            statusMeta?.vaiBaterMeta ? "positivo" : "negativo"
          }`}
        >
          {mensagemStatus}
        </div>
      )}

    </div>
  );
}
