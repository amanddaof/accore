import { useEffect, useState } from "react";
import { buscarTodos } from "../../servicos/banco";
import ResumoEntradas from "./componentes/ResumoEntradas";
import ListaRecebimentos from "./componentes/ListaRecebimentos";
import ModalNovoRecebimento from "./ModalNovoRecebimento";
import { calcularResumo } from "./logica/calculoEntradas";
import "./estilos/entradas.css";

const TOTAL_VENDA = 8000;

export default function Entradas() {
  const [recebimentos, setRecebimentos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  async function carregar() {
    const dados = await buscarTodos("pagamentos");

    const ordenado = dados.sort((a, b) =>
      a.mes.localeCompare(b.mes)
    );

    setRecebimentos(ordenado);
  }

  useEffect(() => {
    carregar();
  }, []);

  const { totalRecebido, falta, percentual, concluido } =
    calcularResumo(recebimentos, TOTAL_VENDA);

  return (
    <div className="pagina-entradas">
      <h1>Entradas</h1>

      <div className="card-entradas">
        <ResumoEntradas
          totalVenda={TOTAL_VENDA}
          totalRecebido={totalRecebido}
          falta={falta}
          percentual={percentual}
          concluido={concluido}
        />

        {!concluido && (
          <button
            className="btn-primario"
            onClick={() => setMostrarModal(true)}
          >
            + Registrar recebimento
          </button>
        )}

        <ListaRecebimentos recebimentos={recebimentos} />
      </div>

      {mostrarModal && (
        <ModalNovoRecebimento
          fechar={() => setMostrarModal(false)}
          atualizar={carregar}
        />
      )}
    </div>
  );
}
