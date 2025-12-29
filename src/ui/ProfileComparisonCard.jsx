import { useMemo } from "react";

export default function ProfileComparisonCard({ 
  mes, 
  mensal, 
  salarios, 
  transactions, 
  profile 
}) {
  const mesAnterior = useMemo(() => {
    const [ano, mesNum] = mes.split('-').map(Number);
    return `${ano}${mesNum.toString().padStart(2, '0') - 1}`.slice(-6);
  }, [mes]);

  const dadosAtual = useMemo(() => {
    if (!mensal || !profile?.display_name) return { gasto: 0, sobra: 0 };

    const usuario = profile.display_name.toLowerCase();
    return {
      gasto: mensal[usuario]?.gasto ?? 0,
      sobra: salarios?.[usuario === 'amanda' ? 'amanda' : 'celso']?.sobra ?? 0
    };
  }, [mensal, profile, salarios]);

  const dadosAnterior = useMemo(() => {
    if (!mensal || !profile?.display_name) return { gasto: 0 };

    const usuario = profile.display_name.toLowerCase();
    return {
      gasto: mensal[mesAnterior]?.[usuario] ?? 0
    };
  }, [mensal, mesAnterior, profile]);

  const variacaoGasto = dadosAtual.gasto - dadosAnterior.gasto;
  const variacaoPercent = dadosAnterior.gasto ? 
    ((dadosAtual.gasto / dadosAnterior.gasto - 1) * 100).toFixed(1) : 0;

  const statusTexto = variacaoGasto === 0 ? "Sem variação" :
                     variacaoGasto > 0 ? `${variacaoPercent}% ↑` : `${Math.abs(variacaoPercent)}% ↓`;

  return (
    <div className="profile-comparativo-card">
      <div className="comparativo-header">
        <span className="comparativo-icon">👥</span>
        <span className="comparativo-titulo">
          Comparativo {profile?.display_name || ''} 
          <small>vs mês passado</small>
        </span>
      </div>

      <div className="comparativo-grid">
        <div className="comparativo-item">
          <div className="valor-atual">R$ {dadosAtual.gasto.toFixed(2)}</div>
          <div className="label">Este mês</div>
        </div>

        <div className="comparativo-item">
          <div className="valor-anterior">R$ {dadosAnterior.gasto.toFixed(2)}</div>
          <div className="label">Mês passado</div>
        </div>

        <div className="comparativo-item variacao">
          <div className={`variacao-numero ${variacaoGasto >= 0 ? 'pos' : 'neg'}`}>
            {statusTexto}
          </div>
          <div className="label">Variação</div>
        </div>
      </div>

      <div className="comparativo-sobra">
        💰 Sobra atual: <strong>R$ {dadosAtual.sobra.toFixed(2)}</strong>
      </div>
    </div>
  );
}
