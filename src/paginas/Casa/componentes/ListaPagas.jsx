import { useState } from "react";
import money from "../../../utils/money";

export default function ListaPagas({ titulo, bills }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="lista-bills">
      <button
        className="lista-header"
        onClick={() => setAberto(v => !v)}
      >
        {aberto ? "▼" : "▶"} {titulo} ({bills.length})
      </button>

      {aberto &&
        bills.map(b => {
          const valor =
            Number(b.valor_real) > 0
              ? b.valor_real
              : b.valor_previsto;

          return (
            <div key={b.id} className="bill-card pago">
              <div className="bill-top">
                <span className="bill-mes">{b.mes}</span>
                <span className="bill-status ok">
                  Pago
                </span>
              </div>

              <div className="bill-valor pequeno">
                {money(valor)}
              </div>
            </div>
          );
        })}
    </div>
  );
}
