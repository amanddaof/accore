import { useState } from "react";
import { inserir, atualizar } from "../../servicos/banco";
import "./estilos/modalEconomia.css";

export default function ModalNovaMeta({ fechar, ano, metaAtual, aoSalvar }) {

  const [valor, setValor] = useState(metaAtual?.valor || "");

  async function salvar() {
    let resultado;

    if (metaAtual) {
      resultado = await atualizar("meta_economia", metaAtual.id, {
        valor: Number(valor)
      });
    } else {
      resultado = await inserir("meta_economia", {
        ano,
        valor: Number(valor)
      });
    }

    if (resultado) {
      aoSalvar(resultado);
      fechar();
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Meta {ano}</h2>

        <input
          type="number"
          placeholder="Valor da meta"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />

        <div className="modal-botoes">
          <button onClick={fechar} className="botao-secundario">
            Cancelar
          </button>
          <button onClick={salvar} className="botao-primario">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
