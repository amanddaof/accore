// src/ui/ProfileComparisonCard.jsx
import { useMemo } from "react";
import { money } from "../utils/money";

// --------------------------------------------------
// Componente: comparativo mensal de quem está logado
// --------------------------------------------------

export default function ProfileComparisonCard({
  mensal,
  comparativoMensal,
  profile
}) {
  const usuario = profile?.display_name?.toLowerCase();

  // 🚨 se faltar algo, não renderiza nada (evita tela branca)
  if (!mensal || !comparativoMensal || !usuario) {
    return null;
  }

  // 🔎 pega o total atual por pessoa
  const gastoAtual = useMemo(() => {
    const pessoa = mensal.porPessoa?.find(
      (p) => p.nome.toLowerCase() === usuario
    );
    return pessoa?.total ?? 0;
  }, [mensal, usuario]);

  // ⏳ pega o total anterior por pessoa usando comparativoMensal
  const gastoAnterior = useMemo(() => {
    if (!comparativoMensal?.porPessoa) return 0;
    const anterior = comparativoMensal.porPessoa?.find(
      (p) => p.nome.toLowerCase() === usuario
    );
    return anterior?.total ?? 0;
  }, [comparativoMensal, usuario]);

  // 📊 variação absoluta e percentual
  const variacao = gastoAtual - gastoAnterior;

  const variacaoPercent = gastoAnterior
    ? ((variacao / gastoAnterior) * 100).toFixed(1)
    : 0;

  const textoVariação =
    variacao === 0
      ? "sem variação"
      : variacao > 0
      ? "gastou mais"
      : "gastou menos";

  return (
    <div className="profile-comparativo-card">
      <strong>{profile?.display_name} — Comparativo mensal</strong>

      <div style={{ marginTop: "6px" }}>
        <span>💸 Atual: </span>
        <strong>{money(gastoAtual)}</strong>
      </div>

      <div>
        <span>📅 Anterior: </span>
        <strong>{money(gastoAnterior)}</strong>
      </div>

      <div style={{ marginTop: "6px" }}>
        <span>{variacao >= 0 ? "▲" : "▼"} </span>
        <strong>{variacaoPercent}%</strong>
        <span> ({textoVariação})</span>
      </div>
    </div>
  );
}
