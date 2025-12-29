import { useMemo } from "react";

export default function ProfileComparisonCard({
  mes,
  mensal,
  salarios,
  profile
}) {
  if (!mensal || !mensal.porPessoa) return null;

  const usuario = profile?.display_name;

  // pessoa atual no array
  const pessoaAtual = mensal.porPessoa.find(
    p => p.nome.toLowerCase() === usuario.toLowerCase()
  );

  // total atual
  const totalAtual = pessoaAtual?.total ?? 0;

  // identificar mês anterior
  const [ano, mesNum] = mes.split('-').map(Number);
  const mesAnteriorNum = mesNum === 1 ? 12 : mesNum - 1;
  const anoAnterior = mesAnteriorNum === 12 ? ano - 1 : ano;
  const mesAnterior = `${anoAnterior}-${String(mesAnteriorNum).padStart(2, "0")}`;

  // pessoa no mês anterior
  const pessoaAnteriorData =
    mensal?.historico?.[mesAnterior]?.porPessoa?.find(
      p => p.nome.toLowerCase() === usuario.toLowerCase()
    ) ?? null;

  const totalAnterior = pessoaAnteriorData?.total ?? 0;

  // variação
  const variacaoValor = totalAtual - totalAnterior;
  const variacaoPercent =
    totalAnterior > 0 ? ((variacaoValor / totalAnterior) * 100).toFixed(1) : 0;

  const variacaoTexto =
    variacaoValor === 0
      ? "sem variação"
      : variacaoValor > 0
      ? `${variacaoPercent}% (gastou mais)`
      : `${variacaoPercent}% (gastou menos)`;

  return (
    <div className="profile-compare-card">
      <strong>{usuario}</strong> — Comparativo mensal

      <div style={{ marginTop: "6px" }}>
        <span>💸 Atual: <strong>R$ {totalAtual.toFixed(2)}</strong></span><br/>
        <span>📅 Anterior: <strong>R$ {totalAnterior.toFixed(2)}</strong></span><br/>
        <span>
          {variacaoValor > 0 ? "▲" : variacaoValor < 0 ? "▼" : "■"}{" "}
          {variacaoTexto}
        </span>
      </div>
    </div>
  );
}
