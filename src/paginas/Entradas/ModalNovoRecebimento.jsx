import { useState } from "react";
import { inserir } from "../../servicos/banco";
import "./estilos/modalEntradas.css";

export default function ModalNovoRecebimento({
  fechar,
  atualizar,
}) {
  const [valor, setValor] = useState("");
  const [mes, setMes] = useState("");

  async function salvar() {
    if (!valor || !mes) return;

    await inserir("pagamentos", {
      valor: Number(valor),
      mes,
    });

    atualizar();
    fechar();
  }

  return (
    <div className="overlay" onClick={fechar}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Novo recebimento</h2>

        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) =>
            setValor(e.target.value)
          }
        />

        <input
          type="month"
          value={mes}
          onChange={(e) =>
            setMes(e.target.value)
          }
        />

        <div className="acoes-modal">
          <button
            className="btn-secundario"
            onClick={fechar}
          >
            Cancelar
          </button>
          <button
            className="btn-primario"
            onClick={salvar}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
