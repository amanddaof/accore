import { useEffect, useState } from "react";
import "./estilos/limites.css";

export default function ModalLimite({
  aberto,
  cartao,
  aoFechar,
  aoSalvar,
}) {
  const [limite, setLimite] = useState("");

  useEffect(() => {
    if (cartao) {
      setLimite(cartao.limite || 0);
    }
  }, [cartao]);

  if (!aberto) return null;

  return (
    <div className="overlay-modal">
      <div className="modal-limite">
        <h2>{cartao.name}</h2>

        <label>Novo limite</label>
        <input
          type="number"
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
        />

        <div className="acoes-modal">
          <button
            className="botao-primario"
            onClick={() => aoSalvar(Number(limite))}
          >
            Salvar
          </button>

          <button className="botao-secundario" onClick={aoFechar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
