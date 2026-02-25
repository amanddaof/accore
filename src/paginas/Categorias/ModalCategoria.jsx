import { useEffect, useState } from "react";
import {
  criarCategoria,
  atualizarCategoria
} from "./logica/serieCategorias";

export default function ModalCategoria({
  aberto,
  categoria,
  aoFechar,
  aoSalvar
}) {

  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#8B5CF6");

  useEffect(() => {
    if (categoria) {
      setNome(categoria.name);
      setCor(categoria.color);
    } else {
      setNome("");
      setCor("#8B5CF6");
    }
  }, [categoria]);

  if (!aberto) return null;

  async function salvar() {
    if (!nome.trim()) return;

    if (categoria) {
      await atualizarCategoria(categoria.id, {
        name: nome,
        color: cor
      });
    } else {
      await criarCategoria({
        name: nome,
        color: cor,
        active: true
      });
    }

    aoFechar();
    aoSalvar();
  }

  return (
    <div className="overlay-modal">
      <div className="modal-categoria">

        <h2>
          {categoria ? "Editar Categoria" : "Nova Categoria"}
        </h2>

        <label>Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label>Cor</label>
        <input
          type="color"
          value={cor}
          onChange={(e) => setCor(e.target.value)}
        />

        <div className="acoes-modal">
          <button
            className="botao-primario"
            onClick={salvar}
          >
            Salvar
          </button>

          <button
            className="botao-secundario"
            onClick={aoFechar}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
