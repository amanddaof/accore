import { useEffect, useState } from "react";
import { carregarLimites, atualizarLimiteCartao } from "./logica/serieLimites";
import ModalLimite from "./ModalLimite";
import "./estilos/limites.css";

export default function Limites() {
  const [cartoes, setCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  async function buscar() {
    const dados = await carregarLimites();
    setCartoes(dados);
  }

  useEffect(() => {
    buscar();
  }, []);

  async function salvar(novoLimite) {
    await atualizarLimiteCartao(cartaoSelecionado.id, novoLimite);
    setModalAberto(false);
    setCartaoSelecionado(null);
    buscar();
  }

  return (
    <div className="pagina-limites">
      <h1>Limites dos Cartões</h1>

      <div className="lista-limites">
        {cartoes.map((cartao) => (
          <div key={cartao.id} className="card-limite">
  <div className="info-cartao">
    <span className="nome-cartao">{cartao.nome}</span>
    <span className="valor-cartao">
      {Number(cartao.limite).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </span>
  </div>

  <button
    className="botao-editar"
    onClick={() => {
      setCartaoSelecionado(cartao);
      setModalAberto(true);
    }}
  >
    Editar
  </button>
</div>
        ))}
      </div>

      <ModalLimite
        aberto={modalAberto}
        cartao={cartaoSelecionado}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={salvar}
      />
    </div>
  );
}
