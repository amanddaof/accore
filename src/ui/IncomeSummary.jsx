import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "./IncomeSummary.css";

const TOTAL_ESPERADO = 8000;

export default function IncomeSummary() {

  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("payments").select("valor");
      const soma = data.reduce((s, x) => s + Number(x.valor), 0);
      setTotal(soma);
    }
    load();
  }, []);

  const perc = Math.min((total / TOTAL_ESPERADO) * 100, 100);
  const falta = Math.max(TOTAL_ESPERADO - total, 0);

  return (
    <div className="card glass income-card">
      <h3>Recebimentos</h3>

      <div className="income-values">
        <span>Recebido: <strong>R$ {total.toFixed(2)}</strong></span>
        <span>Meta: <strong>R$ {TOTAL_ESPERADO.toFixed(2)}</strong></span>
        <span>Falta: <strong>R$ {falta.toFixed(2)}</strong></span>
      </div>

      <div className="income-bar">
        <div className="income-progress" style={{ width: `${perc}%` }} />
      </div>

      <div className="income-percent">{perc.toFixed(1)}% recebido</div>

    </div>
  );
}
