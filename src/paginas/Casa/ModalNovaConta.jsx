import { useState } from "react";
import { salvarNovaConta } from "../../logica/logicaCasa";
import "./estilos/modalNovaConta.css";

const CONTAS = ["Água", "Luz", "Internet", "Aluguel"];

export default function ModalNovaConta({ fechar, aoSalvar }) {
  const [mes, setMes] = useState("");
  const [conta, setConta] = useState("");
  const [valorPrevisto, setValorPrevisto] = useState("");
  const [valorReal, setValorReal] = useState("");
  const [status, setStatus] = useState("Pendente");

  async function handleSalvar() {
    const nova = await salvarNovaConta({
      mes,
      conta,
      valor_previsto: valorPrevisto,
      valor_real: valorReal,
      status
    });

    if (nova) {
      aoSalvar(nova);
      fechar();
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Nova Conta</h2>

        <input
          type="month"
          value={mes}
          onChange={e => setMes(e.target.value)}
        />

        <select
          value={conta}
          onChange={e => setConta(e.target.value)}
        >
          <option value="">Selecione a conta</option>
          {CONTAS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Valor previsto"
          value={valorPrevisto}
          onChange={e => setValorPrevisto(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor real (opcional)"
          value={valorReal}
          onChange={e => setValorReal(e.target.value)}
        />

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="Pendente">Pendente</option>
          <option value="Pago">Pago</option>
        </select>

        <div className="modal-botoes">
          <button onClick={fechar} className="botao-secundario">
            Cancelar
          </button>
          <button onClick={handleSalvar} className="botao-primario">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
