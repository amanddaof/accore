import { useMemo } from "react";
import { money } from "../utils/money";

export default function ProfileComparisonCard({ mes, mensal, salarios, profile }) {
  const usuario = profile?.display_name?.toLowerCase();

  const [anoAtual, mesAtualNum] = mes.split('-').map(Number);
  const mesAnteriorNum = mesAtualNum === 1 ? 12 : mesAtualNum - 1;
  const anoAnterior = mesAnteriorNum === 12 ? anoAtual - 1 : anoAtual;
  const mesAnterior = `${anoAnterior}-${mesAnteriorNum.toString().padStart(2, '0')}`;

  function getTotal(mesStr) {
    return mensal?.[mesStr]?.[usuario]?.total || 0;
  }

  const totalAtual = useMemo(() => getTotal(mes), [mes, mensal, usuario]);
  const totalAnterior = useMemo(() => getTotal(mesAnterior), [mesAnterior, mensal, usuario]);

  const variacao = totalAtual - totalAnterior;
  const variacaoPercent = totalAnterior
    ? ((variacao / totalAnterior) * 100).toFixed(1)
    : 0;

  return (
    <div className="profile-comparativo-card">
      <strong>{profile.display_name} — Comparativo mensal</strong>

      <div style={{ marginTop: "8px" }}>
        🟢 Atual: <strong>{money(totalAtual)}</strong>
      </div>
      <div>
        🔵 Anterior: <strong>{money(totalAnterior)}</strong>
      </div>

      <div style={{ marginTop: "8px" }}>
        {variacao === 0
          ? "— sem variação"
          : `${variacaoPercent}% (${variacao > 0 ? "gastou mais" : "gastou menos"})`}
      </div>
    </div>
  );
}
