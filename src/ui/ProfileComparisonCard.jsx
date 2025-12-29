import { money } from "../utils/money";

export default function ProfileComparisonCard({ mensal, profile }) {
  const usuario = profile?.display_name?.toLowerCase();
  
  // ✅ EXATAMENTE como no debug que funcionou
  const pessoaData = mensal?.porPessoa?.[usuario];
  
  if (!pessoaData) {
    return <div>Comparativo indisponível</div>;
  }

  const atual = Number(pessoaData.total ?? 0);
  const anterior = 0; // Não tem dados anteriores ainda

  return (
    <div className="profile-comparativo-card">
      <strong>{profile.display_name} — Gastos este mês</strong>

      <div style={{ marginTop: "8px" }}>
        🟢 Total: <strong>{money(atual)}</strong>
      </div>
      
      <div style={{ marginTop: "8px" }}>
        📊 Primeiro mês com dados
      </div>
    </div>
  );
}
