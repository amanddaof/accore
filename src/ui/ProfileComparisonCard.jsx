import { money } from "../utils/money";
import { useMemo } from "react";

function getPessoaData(porPessoa, usuario) {
  if (!porPessoa) return null;

  if (!Array.isArray(porPessoa) && porPessoa[usuario]) {
    return porPessoa[usuario];
  }

  if (Array.isArray(porPessoa)) {
    const item = porPessoa.find(p => p.nome?.toLowerCase() === usuario);
    if (item) return {
      atual: { total: item.total ?? item.atual?.total ?? 0 },
      anterior: { total: item.anterior?.total ?? 0 }
    };
  }

  return null;
}

export default function ProfileComparisonCard({ mes, mensal, profile }) {
  const usuario = profile?.display_name?.toLowerCase();
  const pessoaData = getPessoaData(mensal?.porPessoa, usuario); // ✅ MES ATUAL funcionando

  // ✅ CORRIGIDO: MÊS ANTERIOR do MESMO objeto porPessoa
  const mesAnteriorData = useMemo(() => {
    if (!pessoaData?.anterior?.total) return 0;
    return Number(pessoaData.anterior.total);
  }, [pessoaData]);

  const atual = Number(pessoaData?.atual?.total ?? 0);
  const anterior = mesAnteriorData;

  const variacao = atual - anterior;
  const variacaoPercent = anterior ? ((variacao / anterior) * 100).toFixed(1) : 0;

  if (!pessoaData) {
    return <div>⚠️ Sem dados para comparar ({usuario})</div>;
  }

  return (
    <div className="profile-comparativo-card">
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <strong>{profile?.display_name}</strong>
        <span style={{ fontSize: '0.85em', opacity: 0.8 }}>Este mês vs anterior</span>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
        <div>🟢 Este mês: <strong>{money(atual)}</strong></div>
        <div>🔵 Mês passado: <strong>{money(anterior)}</strong></div>
      </div>

      <div>
        📊 {variacao === 0 ? "— sem variação" : 
          `${variacaoPercent}% ${variacao > 0 ? "↑ gastou mais" : "↓ gastou menos"}`}
      </div>
    </div>
  );
}
