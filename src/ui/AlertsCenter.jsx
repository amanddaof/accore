import { gerarAlertas } from "../services/alerts.service";
import "./AlertsCenter.css";

export default function AlertsCenter({ mensal, salarios, onClose }) {

  const dados = gerarAlertas({ mensal, salarios });

  function icon(tipo) {
    if (tipo === "critico") return "⛔";
    if (tipo === "atencao") return "⚠️";
    return "✅";
  }

  function renderGrupo(titulo, lista) {
    return (
      <div className="alerts-group">
        <h4>{titulo}</h4>
        {lista.map((a,i) => (
          <div key={i} className={`alert-row ${a.tipo}`}>
            <span>{icon(a.tipo)}</span>
            {a.msg}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="alerts-overlay" onClick={onClose} />

      <div className="alerts-panel">
        <header>
          <h3>Notificações</h3>
          <button onClick={onClose}>✕</button>
        </header>

        <div className="alerts-body">
          {renderGrupo("Amanda", dados.amanda)}
          {renderGrupo("Celso", dados.celso)}
          {renderGrupo("Geral", dados.geral)}
        </div>
      </div>
    </>
  );
}
