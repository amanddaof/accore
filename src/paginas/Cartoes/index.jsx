import { useEffect, useState } from "react";
import { buscarTodos } from "../../servicos/banco";
import { useMes } from "../../contextos/MesContexto";
import CartaoResumo from "./componentes/CartaoResumo";
import CartaoExpandido from "./componentes/CartaoExpandido";
import "./estilos/cartoes.css";

export default function Cartoes() {
  const [cartoes, setCartoes] = useState([]);
  const [cartaoAberto, setCartaoAberto] = useState(null);
  const { mesSelecionado } = useMes();

  useEffect(() => {
    async function carregar() {
      const lista = await buscarTodos("cartoes");
      setCartoes(lista || []);
    }

    carregar();
  }, []);

  if (cartaoAberto) {
    return (
      <main className="pagina-cartoes">
        <CartaoExpandido
          cartao={cartaoAberto}
          mesFiltro={mesSelecionado}
          onVoltar={() => setCartaoAberto(null)}
        />
      </main>
    );
  }

  return (
    <main className="pagina-cartoes">
      <div className="grid-cartoes">
        {cartoes
          .filter(c => c.nome !== "Externo")
          .map(cartao => (
            <CartaoResumo
              key={cartao.id}
              cartao={cartao}
              mesFiltro={mesSelecionado}
              onClick={() => setCartaoAberto(cartao)}
            />
          ))}
      </div>
    </main>
  );
}
