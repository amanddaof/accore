import { useMemo } from "react";

export default function ProfileComparisonCard({ 
  comparativoMensal, 
  mensal, 
  profile 
}) {
  const usuario = profile?.display_name?.toLowerCase();

  // 🔥 pega o atual no formato REAL do mensal
  const atual = useMemo(() => {
    return mensal?.porPessoa?.find(p => 
      p.nome.toLowerCase() === usuario
    )?.total || 0;
  }, [mensal, usuario]);

  // 🔥 pega o anterior do comparativo do backend
  const anterior = useMemo(() => {
    return comparativoMensal?.porPessoa?.[usuario]?.anterior?.total || 0;
  }, [comparativoMensal, usuario]);

  const variacao = atual - anterior;
  const variacaoPercent = anterior ? ((variacao / anterior) * 100).toFixed(1) : 0;

  return (
    <div className="profile-comparativo-card">
      <strong>{profile?.display_name}</strong> — Comparativo mensal
      <br />

      <div>💸 Atual: R$ {atual.toFixed(2)}</div>
      <div>📆 Anterior: R$ {anterior.toFixed(2)}</div>

      <div style={{ marginTop: 8 }}>
        {variacao === 0
          ? "Sem variação"
          : variacao > 0
          ? `▲ +${variacaoPercent}% (gastou mais)`
          : `▼ ${variacaoPercent}% (gastou menos)`
        }
      </div>
    </div>
  );
}
