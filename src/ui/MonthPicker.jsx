import { useState, useEffect } from "react";
import "./MonthPicker.css"; // criaremos já já

const meses = [
  "jan","fev","mar","abr","mai","jun",
  "jul","ago","set","out","nov","dez"
];

export default function MonthPicker({ mesISO, onChange }) {
  const [open, setOpen] = useState(false);
  
  // mesISO chega tipo "2026-01"
  const anoInicial = Number(mesISO.split("-")[0]);
  const mesInicial = Number(mesISO.split("-")[1]) - 1;

  const [ano, setAno] = useState(anoInicial);
  const [mes, setMes] = useState(mesInicial);

  // quando mudar mês ou ano → avisa o pai
  useEffect(() => {
    const m = String(mes + 1).padStart(2, "0");
    onChange(`${ano}-${m}`);
  }, [ano, mes, onChange]);

  function formatar() {
    return `${meses[mes]} de ${ano}`;
  }

  function selecionarMes(idx) {
    setMes(idx);
    setOpen(false);
  }

  return (
    <div className="monthpicker-wrapper">
      <button className="monthpicker-btn" onClick={() => setOpen(true)}>
        {formatar()}
      </button>

     {open && (
  <div className="monthpicker-popover" onClick={() => setOpen(false)}>
    <div className="monthpicker-popup" onClick={e => e.stopPropagation()}>
            <div className="monthpicker-header">
              <button onClick={() => setAno(a => a - 1)}>◀</button>
              <strong>{ano}</strong>
              <button onClick={() => setAno(a => a + 1)}>▶</button>
            </div>

            <div className="monthpicker-grid">
              {meses.map((m, idx) => (
                <button
                  key={m}
                  className={idx === mes ? "active" : ""}
                  onClick={() => selecionarMes(idx)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
