import { money } from "../utils/money";

function getPessoaData(porPessoa, usuario) {
  if (!porPessoa) return null;

  if (!Array.isArray(porPessoa) && porPessoa[usuario]) {
    const data = porPessoa[usuario];
    return {
      atual: { total: data.total ?? data.atual?.total ?? data.gasto ?? 0 },
      anterior: { total: 0 } // ✅ Mês anterior não existe nos dados
    };
  }

  return null;
}

export default function ProfileComparisonCard({ mensal, profile }) {
  const usuario = profile?.display_name?.toLowerCase();
  const pessoaData = getPessoaData(mensal?.porPessoa, usuario);

  if (!pessoaData) {
    return <div>⚠️ Sem dados suficientes para comparar ({usuario})</div>;
  }

  const atual = Number(pessoaData.atual?.total ?? 0);
  const anterior = Number(pessoaData.anterior?.total ?? 0);

  const variacao = atual - anterior;
  const variacaoPercent = anterior
    ? ((variacao / anterior) * 100).toFixed(1)
    : "Novo";

  return (
    <div className="profile-comparativo-card">
      <strong>{profile.display_name} — Comparativo mensal</strong>

      <div style={{ marginTop: "8px" }}>
        🟢 Atual: <strong>{money(atual)}</strong>
      </div>
      <div>
        🔵 Anterior: <strong>{anterior > 0 ? money(anterior) : "— sem dados"}</strong>
      </div>

      <div style={{ marginTop: "8px" }}>
        {anterior === 0 
          ? "📊 Primeiro mês com dados" 
          : variacao === 0
          ? "— sem variação"
          : `${variacaoPercent}% (${variacao > 0 ? "gastou mais" : "gastou menos"})`}
      </div>
    </div>
  );
}
