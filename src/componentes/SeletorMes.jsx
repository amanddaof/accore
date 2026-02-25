import { useState } from "react";
import { useMes } from "../contextos/MesContexto";
import "./estilos/SeletorMes.css";

const MESES = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez"
];

export default function SeletorMes() {
  const { mesSelecionado, setMesSelecionado } = useMes();
  const [aberto, setAberto] = useState(false);
console.log("SELETOR - mês atual:", mesSelecionado);
  const [mesAtual, anoAtual] = mesSelecionado.split("/");

  function selecionarMes(mes) {
    console.log("CLICOU NO MÊS:", mes);
    console.log("ANTES DO SET:", mesSelecionado);
    setMesSelecionado(`${mes}/${anoAtual}`);
    setAberto(false);
  }

  function mudarAno(delta) {
    setMesSelecionado(`${mesAtual}/${Number(anoAtual) + delta}`);
  }

  return (
    <div className="seletor-mes">
      <button
        className="pill-mes"
        onClick={() => setAberto(v => !v)}
      >
        {mesSelecionado}
      </button>

      {aberto && (
        <div className="popover-mes">
          <div className="ano-controle">
            <button onClick={() => mudarAno(-1)}>◀</button>
            <strong>20{anoAtual}</strong>
            <button onClick={() => mudarAno(1)}>▶</button>
          </div>

          <div className="grid-meses">
            {MESES.map(mes => (
              <button
                key={mes}
                className={
                  mes === mesAtual ? "ativo" : ""
                }
                onClick={() => selecionarMes(mes)}
              >
                {mes.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
