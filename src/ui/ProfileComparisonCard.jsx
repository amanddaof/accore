import { money } from "../utils/money";
import { useMemo } from "react";

/**
 * Obtém os dados por pessoa independente da forma:
 * 1) objeto: { amanda: { atual, anterior } }
 * 2) array:  [ { nome: "Amanda", atual, anterior } ]
 */
function getPessoaData(porPessoa, usuario) {
  if (!porPessoa) return null;

  // forma objeto
  if (!Array.isArray(porPessoa) && porPessoa[usuario]) {
    return porPessoa[usuario];
  }

  // forma array
  if (Array.isArray(porPessoa)) {
    const item = porPessoa.find(
      p => p.nome?.toLowerCase() === usuario
    );
    if (item) return {
      atual: { total: item.total ?? item.atual?.total ?? 0 },
      anterior: { total: item.anterior?.total ?? 0 }
    };
  }

  return null;
}

export default function ProfileComparisonCard({ mes, mensal, profile }) {
  // ✅ CALCULA MÊS ANTERIOR
  const mesAnterior = useMemo(() => {
    const [ano, mesNum] = mes.split('-').map(Number);
    const mesAntNum = mesNum === 1 ? 12 : mesNum - 1;
    const anoAnt = mesNum === 1 ? ano - 1 : ano;
    return `${anoAnt}-${mesAntNum.toString().padStart(2, '0')}`;
  }, [mes]);

  const usuario = profile?.display_name?.toLowerCase();

  // ✅ DADOS ATUAIS (mes atual)
  const pessoaAtual = getPessoaData(mensal?.[mes]?.porPessoa, usuario);
  const atual = Number(pessoaAtual?.atual?.total ?? 0);

  // ✅ DADOS ANTERIORES (mes anterior)
  const pessoaAnterior = getPessoaData(mensal?.[mesAnterior]?.porPessoa, usuario);
  const anterior = Number(pessoaAnterior?.atual?.total ?? pessoaAnterior?.anterior?.total ?? 0);

  const variacao = atual - anterior;
  const variacaoPercent = anterior
    ? ((variacao / anterior) * 100).toFixed(1)
    : 0;

  if (!pessoaAtual && !pessoaAnterior) {
    return <div>⚠️ Sem dados para comparar ({usuario})</div>;
  }

  return (
    <div className="profile-comparativo-card">
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <strong>{profile?.display_name}</strong>
        <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
          {mesAnterior} → {mes}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
        <div>
          🟢 Este mês: <strong>{money(atual)}</strong>
        </div>
        <div>
          🔵 Mês passado: <strong>{money(anterior)}</strong>
        </div>
      </div>

      <div>
        📊 {variacao === 0
          ? "— sem variação"
          : `${variacaoPercent}% ${variacao > 0 ? "↑ gastou mais" : "↓ gastou menos"}`}
      </div>
    </div>
  );
}
