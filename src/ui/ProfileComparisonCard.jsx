import { useMemo } from "react";

export default function ProfileComparisonCard({ 
  mes, 
  mensal, 
  salarios, 
  profile 
}) {
  const [anoAtual, mesAtualNum] = mes.split('-').map(Number);
  const mesAnteriorNum = mesAtualNum === 1 ? 12 : mesAtualNum - 1;
  const anoAnterior = mesAnteriorNum === 12 ? anoAtual - 1 : anoAtual;
  const mesAnterior = `${anoAnterior}-${mesAnteriorNum.toString().padStart(2, '0')}`;

  const usuario = profile?.display_name?.toLowerCase();

  // DADOS ATUAIS
  const gastoAtual = useMemo(() => {
    if (!mensal?.[mes]?.[usuario]) return 0;
    return mensal[mes][usuario].gasto || 0;
  }, [mensal, mes, usuario]);

  const sobraAtual = useMemo(() => {
    if (!salarios || !usuario) return 0;
    const salarioKey = usuario === 'amanda' ? 'amanda' : 'celso';
    return salarios[salarioKey]?.sobra || 0;
  }, [salarios, usuario]);

  // DADOS ANTERIORES
  const gastoAnterior = useMemo(() => {
    if (!mensal?.[mesAnterior]?.[usuario]) return 0;
    return mensal[mesAnterior][usuario].gasto || 0;
  }, [mensal, mesAnterior, usuario]);

  const variacao = gastoAtual - gastoAnterior;
  const variacaoPercent = gastoAnterior ? 
    ((variacao / gastoAnterior) * 100).toFixed(1) : 0;

  const statusTexto = variacao === 0 ? "Sem variação" :
    variacao > 0 ? `+${variacaoPercent}%` : `${variacaoPercent}%`;

  return (
    <div className="profile-comparativo-card">
      <div className="comparativo-header">
        <span className="comparativo-icon">👥</span>
        <span className="comparativo-titulo">
          {profile?.display_name || ''} vs mês passado
          <small>{mesAnterior} → {mes}</small>
        </span>
      </div>

      <div className="comparativo-grid">
        <div className="comparativo-item">
          <div className="valor-atual">R$ {gastoAtual.toFixed(2)}</div>
          <small>Este mês</small>
        </div>

        <div className="comparativo-item">
          <div className="valor-anterior">R$ {gastoAnterior.toFixed(2)}</div>
          <small>Mês passado</small>
        </div>

        <div className="comparativo-item variacao">
          <div className={`variacao-numero ${variacao >= 0 ? 'pos' : 'neg'}`}>
            {statusTexto}
          </div>
          <small>Variação</small>
        </div>
      </div>

      <div className="comparativo-sobra">
        💰 Sobra: <strong>R$ {sobraAtual.toFixed(2)}</strong>
      </div>
    </div>
  );
}
