import { money } from "../utils/money";

function getPessoaData(porPessoa, usuario) {
  console.log("🔍 DEBUG - porPessoa:", porPessoa);
  console.log("🔍 DEBUG - usuario:", usuario);
  
  if (!porPessoa) return null;

  if (!Array.isArray(porPessoa) && porPessoa[usuario]) {
    console.log("🔍 DEBUG - ENCONTROU OBJETO:", porPessoa[usuario]);
    const data = porPessoa[usuario];
    return {
      atual: { total: data.total ?? data.atual?.total ?? data.gasto ?? 0 },
      anterior: { total: data.anterior?.total ?? data.anterior ?? data ?? 0 }
    };
  }

  if (Array.isArray(porPessoa)) {
    const item = porPessoa.find(p => p.nome?.toLowerCase() === usuario);
    console.log("🔍 DEBUG - ITEM ARRAY:", item);
    if (item) return {
      atual: { total: item.total ?? item.atual?.total ?? 0 },
      anterior: { total: item.anterior?.total ?? 0 }
    };
  }

  return null;
}

export default function ProfileComparisonCard({ mensal, profile }) {
  const usuario = profile?.display_name?.toLowerCase();
  console.log("🔍 DEBUG - mensal completo:", mensal);
  
  const pessoaData = getPessoaData(mensal?.porPessoa, usuario);
  console.log("🔍 DEBUG - pessoaData:", pessoaData);

  if (!pessoaData) {
    return <div>⚠️ Sem dados suficientes para comparar ({usuario})</div>;
  }

  const atual = Number(pessoaData.atual?.total ?? 0);
  const anterior = Number(pessoaData.anterior?.total ?? 0);

  console.log("🔍 DEBUG - FINAL atual:", atual, "anterior:", anterior);

  const variacao = atual - anterior;
  const variacaoPercent = anterior
    ? ((variacao / anterior) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <strong>{profile.display_name} — Comparativo mensal</strong>

      <div style={{ marginTop: "8px" }}>
        🟢 Atual: <strong>{money(atual)}</strong>
      </div>
      <div>
        🔵 Anterior: <strong>{money(anterior)}</strong>
      </div>

      <div style={{ marginTop: "8px" }}>
        {variacao === 0
          ? "— sem variação"
          : `${variacaoPercent}% (${variacao > 0 ? "gastou mais" : "gastou menos"})`}
      </div>
    </div>
  );
}
