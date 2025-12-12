import { money } from "../utils/money";

export default function CardsSummary({ resumo }) {
  const disponivel = resumo.limite - resumo.usado;
  const pct = resumo.limite ? (resumo.usado / resumo.limite) * 100 : 0;

  function status() {
    if (pct > 85) return "danger";
    if (pct > 65) return "warning";
    return "ok";
  }

  return (
    <section className="glass card" style={{ marginBottom: 22 }}>
      <div className="section-title">RESUMO DOS CARTÕES</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>

        <Info label="Fatura atual" value={money(resumo.usado)} />

        <Info label="Limite total" value={money(resumo.limite)} />

        <Info label="Disponível" value={money(disponivel)} className={status()} />

      </div>

      <div className="card-progress" style={{ marginTop: 12 }}>
        <div
          className="card-progress-fill"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <small style={{ opacity: .6 }}>
        Utilização: {pct.toFixed(0)}%
      </small>
    </section>
  );
}

function Info({ label, value, className }) {
  return (
    <div className={className}>
      <div style={{ opacity: .6, fontSize: ".7rem" }}>{label}</div>
      <strong style={{ fontSize: "1.2rem" }}>{value}</strong>
    </div>
  );
}
