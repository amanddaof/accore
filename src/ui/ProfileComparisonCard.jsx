import { useMemo } from "react";
import { money } from "../utils/money";

export default function ProfileComparisonCard({ 
  mes,
  mensal,
  salarios,
  profile
}) {
  const usuario = profile?.display_name?.toLowerCase();

  const dadosPessoa = useMemo(() => {
    if (!mensal?.comparativoMensal?.porPessoa) return null;
    return mensal.comparativoMensal.porPessoa[usuario] || null;
  }, [mensal, usuario]);

  if (!dadosPessoa) return null;

  const gastoAtual = Number(dadosPessoa.atual || 0);
  const gastoAnterior = Number(dadosPessoa.anterior || 0);

  const variacao = gastoAtual - gastoAnterior;
  const variacaoPercent = gastoAnterior
    ? ((variacao / gastoAnterior) * 100).toFixed(1)
    : 0;

  const statusTexto =
    variacao === 0
      ? "Sem variação"
      : variacao > 0
      ? `+${variacaoPercent}% a mais`
      : `${variacaoPercent}% a menos`;

  const sobraAtual = salarios?.[usuario]?.sobra ?? 0;

  return (
    <div className="profile-comparativo-card">

      <div className="comparativo-header">
        <span className="comparativo-icon">👥</span>
        <span className="comparativo-titulo">
          {profile?.display_name} — comparação mensal
        </span>
      </div>

      <div className="comparativo-grid">
        <div className="comparativo-item">
          <div className="valor-atual">{money(gastoAtual)}</div>
          <small>Este mês</small>
        </div>

        <div className="comparativo-item">
          <div className="valor-anterior">{money(gastoAnterior)}</div>
          <small>Mês passado</small>
        </div>

        <div className="comparativo-item variacao">
          <div className={`variacao-numero ${variacao >= 0 ? "pos" : "neg"}`}>
            {statusTexto}
          </div>
          <small>Variação</small>
        </div>
      </div>

      <div className="comparativo-sobra">
        💰 Sobra: <strong>{money(sobraAtual)}</strong>
      </div>
    </div>
  );
}
