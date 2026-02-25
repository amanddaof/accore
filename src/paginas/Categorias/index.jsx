import { useEffect, useState } from "react";
import {
  carregarCategorias,
  atualizarCategoria
} from "./logica/serieCategorias";
import ModalCategoria from "./ModalCategoria";
import "./estilos/categorias.css";

export default function Categorias() {

  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  async function buscar() {
    const dados = await carregarCategorias();
    setCategorias(dados);
  }

  useEffect(() => {
    buscar();
  }, []);

  async function alternarStatus(categoria) {
    await atualizarCategoria(categoria.id, {
      active: !categoria.active
    });
    buscar();
  }

  return (
    <div className="pagina-categorias">

      <div className="topo-categorias">
        <h1>Categorias</h1>

        <button
          className="botao-primario"
          onClick={() => {
            setCategoriaSelecionada(null);
            setModalAberto(true);
          }}
        >
          Nova Categoria
        </button>
      </div>

      <div className="lista-categorias">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`card-categoria ${!categoria.active ? "inativa" : ""}`}
          >
            <div className="info-categoria">
              <span
                className="cor-categoria"
                style={{ background: categoria.color }}
              />
              <span className="nome-categoria">
                {categoria.name}
              </span>
            </div>

            <div className="acoes-categoria">
              <button
                className="botao-editar"
                onClick={() => {
                  setCategoriaSelecionada(categoria);
                  setModalAberto(true);
                }}
              >
                Editar
              </button>

              <button
                className="botao-toggle"
                onClick={() => alternarStatus(categoria)}
              >
                {categoria.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ModalCategoria
        aberto={modalAberto}
        categoria={categoriaSelecionada}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={buscar}
      />

    </div>
  );
}
