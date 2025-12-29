import { money } from "../utils/money";

export default function ProfileComparisonCard({ comparativoMensal, porPessoa, profile }) {
  if (!comparativoMensal || !porPessoa || !profile) return null;

  const usuario = profile.display_name.toLowerCase();

  // pessoa atual
  const atualPessoa = porPessoa.find(p => p.nome.toLowerCase() === usuario);
  if (!atualPessoa) return null;

  // pessoa anterior dentro do comparativo
  const anteriorPessoa = comparativoMensal.mesAnterior?.porPessoa?.find(
    p => p.nome.toLowerCase() === usuario
  );

  const atualValor = atualPessoa.total || 0;
  const anteriorValor = anteriorPessoa?.total || 0;

  const variacao = atualValor - anteriorValor;
  const variacaoPercent = anteriorValor ? ((variacao / anteriorValor) * 100).toFixed(1) : 0;

  return (
    <div className="profile-comparativo-card">
      <strong>{profile.display_name}</strong> — Comparativo mensal

      <div>💸 Atual: {money(atualValor)}</div>
      <div>📅 Anterior: {money(anteriorValor)}</div>

      <div style={{ marginTop: "8px" }}>
        {variacao > 0 && <>▲ {variacaoPercent}% (gastou mais)</>}
        {variacao < 0 && <>▼ {variacaoPercent}% (gastou menos)</>}
        {variacao === 0 && <>— 0% (sem variação)</>}
      </div>
    </div>
  );
}
