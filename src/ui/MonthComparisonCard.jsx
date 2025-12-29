import { money } from "../utils/money";
import "./MonthComparisonCard.css";

function formatarMes(label) {
  if (!label || !label.includes("-")) return label;
  const [ano, mes] = label.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${meses[Number(mes) - 1]}/${ano.slice(2)}`;
}

export default function MonthComparisonCard({ mesAnterior, mesAtual, variacao, porPessoa }) {
  // 🔍 DEBUG: vê exatamente o que chega
  console.log('MonthComparisonCard props:', { mesAnterior, mesAtual, variacao });
  
  // ✅ FIX: Math.round() pra float impreciso + fallback
  const anteriorValor = Math.round(Number(mesAnterior?.total ?? mesAnterior?.valor ?? 0));
  const atualValor = Math.round(Number(mesAtual?.total ?? mesAtual?.valor ?? 0));
  const diffValor = Math.round(Number(variacao?.valor ?? (atualValor - anteriorValor)));
  
  console.log('Valores calculados:', { anteriorValor, atualValor, diffValor }); // 🔍 DEBUG

  const subiu = diffValor > 0;
  const igual = diffValor === 0;

  return (
    <section className="month-compare-card">
      <header className="title">Comparativo mensal</header>

      <div className="months">
        <div>
          <span>{formatarMes(mesAtual?.label)}</span>
          <strong>{money(atualValor)}</strong>
        </div>

        <div>
          <span>{formatarMes(mesAnterior?.label)}</span>
          <strong>{money(anteriorValor)}</strong>
        </div>
      </div>

      {igual ? (
        <div className="variation neutral">Sem variação em relação ao mês passado</div>
      ) : (
        <div className={`variation ${subiu ? "up" : "down"}`}>
          <span className="arrow">{subiu ? "▲" : "▼"}</span>
          <strong>{money(Math.abs(diffValor))}</strong>
          <span className="text">{subiu ? "a mais" : "a menos"} que no mês passado</span>
        </div>
      )}

      {/* DEBUG VISUAL TEMPORÁRIO */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{fontSize: '10px', color: '#666', padding: '5px 0'}}>
          Debug: {atualValor.toLocaleString()} | {anteriorValor.toLocaleString()} | {diffValor}
        </div>
      )}
    </section>
  );
}
