import { money } from "../utils/money";

/**
 * Obtém os dados por pessoa independente da forma:
 * 1) objeto: { amanda: { atual, anterior } }
 * 2) array: [ { nome: "Amanda", atual, anterior } ]
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

    if (item) {
      return {
        atual: { total: item.total ?? item.atual?.total ?? 0 },
        anterior: { total: item.anterior?.total ?? 0 }
      };
    }
  }

  return null;
}

export default function ProfileComparisonCard({ mensal, profile }) {
  if (!mensal) {
    return <div>❌ Sem dados mensais carregados</div>;
  }

  const usuario = profile?.display_name?.toLowerCase();
  const pessoaData = getPessoaData(mensal?.porPessoa, usuario);

  if (!pessoaData) {
    return (
      <div>
        ⚠️ Sem dados suficientes para comparar ({usuario})
      </div>
    );
  }

  const atual = Number(pessoaData.atual?.total ?? 0);
  const anterior = Number(pessoaData.anterior?.total ?? 0);

  const variacao = atual - anterior;
  const variacaoPercent = anterior
    ? ((variacao / anterior) * 100).toFixed(1)
    : 0;

  return (
    <div className="profile-comparativo-card">
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
