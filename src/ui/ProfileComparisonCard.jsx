import { money } from "../utils/money";

export default function ProfileComparisonCard({ comparativoMensal, profile }) {
  const pessoa = profile?.display_name?.toLowerCase();
  const data = comparativoMensal?.porPessoa?.[pessoa];

  if (!data) return null;

  const anterior = data.anterior?.total || 0;
  const atual = data.atual?.total || data.total || 0;
  const diff = atual - anterior;

  const percentual = anterior
    ? ((diff / anterior) * 100).toFixed(1)
    : 0;

  const status =
    diff === 0 ? "Sem variação" :
    diff > 0 ? `+${percentual}% (gastou mais)` :
    `${percentual}% (gastou menos)`;

  return (
    <div className="profile-comparativo-card">
      <strong>{profile.display_name}</strong> — Comparativo mensal

      <div>💸 Atual: {money(atual)}</div>
      <div>📅 Anterior: {money(anterior)}</div>

      <div style={{ marginTop: "6px" }}>
        {diff > 0 ? "▲" : diff < 0 ? "▼" : "•"} {status}
      </div>
    </div>
  );
}
