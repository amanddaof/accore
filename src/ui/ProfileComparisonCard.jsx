import { money } from "../utils/money";
import { formatMes } from "../utils/formatMes";
import "./ProfileComparisonCard.css";

export default function ProfileComparisonCard({ mensal, profile }) {
  const usuario = profile?.display_name;
  const pessoaKey = usuario?.toLowerCase();

  const pessoaData = mensal?.porPessoa?.[pessoaKey];
  if (!pessoaData) return null;

  const atual = pessoaData.atual?.total ?? 0;
  const anterior = pessoaData.anterior?.total ?? 0;
  const diff = atual - anterior;
  const pct = anterior ? ((diff / anterior) * 100).toFixed(1) : 0;

  const positivo = diff > 0;
  const negativo = diff < 0;

  return (
    <div className="pcard">
      <span className="pcard-title">{usuario} — Comparativo mensal</span>
      <div className="pcard-divider" />

      {/* ==== LINHA ATUAL ==== */}
      <div className="pcard-line">
        <span className="pcard-label">{formatMes(mensal.mesAtual?.label)}:</span>
        <div className="pcard-value">
          {money(atual)}
          {positivo && <span className="pcard-seta mais"> ↑</span>}
          {negativo && <span className="pcard-seta menos"> ↓</span>}
        </div>
      </div>

      {/* ==== LINHA ANTERIOR ==== */}
      <div className="pcard-line">
        <span className="pcard-label">{formatMes(mensal.mesAnterior?.label)}:</span>
        <div className="pcard-value">{money(anterior)}</div>
      </div>

      {/* ==== RESULTADO ==== */}
      <div className="pcard-resultado">
        {positivo && (
          <strong className="mais">
            ▲ +{pct}% (R$ {money(diff).replace("R$","").trim()})
          </strong>
        )}

        {negativo && (
          <strong className="menos">
            ▼ {pct}% (R$ {money(diff)})
          </strong>
        )}

        {!positivo && !negativo && <span className="igual">Sem diferença</span>}

        <span className="pcard-legenda">
          {positivo && "— gastou mais"}
          {negativo && "— gastou menos"}
        </span>
      </div>
    </div>
  );
}
