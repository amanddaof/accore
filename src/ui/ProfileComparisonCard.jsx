import { money } from "../utils/money";

export default function ProfileComparisonCard({ mensal, profile }) {
  if (!mensal?.comparativoMensal || !mensal?.porPessoa) {
    return <div>🔄 Sem dados suficientes para comparar</div>;
  }

  const usuario = profile.display_name.toLowerCase();

  const pessoaAtual   = mensal.porPessoa[usuario]?.atual?.total   ?? 0;
  const pessoaAnterior = mensal.porPessoa[usuario]?.anterior?.total ?? 0;

  const variacao = pessoaAtual - pessoaAnterior;
  const variacaoPercent = pessoaAnterior
    ? ((variacao / pessoaAnterior) * 100).toFixed(1)
    : 0;

  return (
    <div className="profile-comparativo-card">
      <strong>{profile.display_name} — Comparativo mensal</strong>

      <div style={{ marginTop: "8px" }}>
        🟢 Atual: <strong>{money(pessoaAtual)}</strong>
      </div>
      <div>
        🔵 Anterior: <strong>{money(pessoaAnterior)}</strong>
      </div>

      <div style={{ marginTop: "8px" }}>
        {variacao === 0
          ? "— sem variação"
          : `${variacaoPercent}% (${variacao > 0 ? "gastou mais" : "gastou menos"})`}
      </div>
    </div>
  );
}
