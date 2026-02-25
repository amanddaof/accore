import { useEffect, useState } from "react";
import { buscarTodos } from "../../servicos/banco";
import { useMes } from "../../contextos/MesContexto";
import ModalNovaConta from "./ModalNovaConta";
import ColunaCasa from "./componentes/ColunaCasa";
import "./estilos/casa.css";

const CONTAS = ["Água", "Luz", "Internet", "Aluguel"];

export default function Casa() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const { mesSelecionado } = useMes();

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const data = await buscarTodos("contas");
      setBills(data || []);
      setLoading(false);
    }
    carregar();
  }, []);

  function atualizarBill(updated) {
    setBills(prev =>
      prev.map(b => (b.id === updated.id ? updated : b))
    );
  }

  function porConta(nome) {
    return bills.filter(b => b.conta === nome);
  }

  if (loading) {
    return <main className="casa">Carregando…</main>;
  }

  return (
    <main className="casa">
      <div className="casas-header">
        <h2>Contas da Casa</h2>

        <button
          className="botao-adicionar-conta"
          onClick={() => setModalAberto(true)}
        >
          + Nova Conta
        </button>
      </div>

      {modalAberto && (
        <ModalNovaConta
          fechar={() => setModalAberto(false)}
          aoSalvar={(novaConta) =>
            setBills(prev => [...prev, novaConta])
          }
        />
      )}

      <div className="casa-colunas">
        {CONTAS.map(nome => (
          <ColunaCasa
            key={nome}
            nome={nome}
            bills={porConta(nome)}
            mesSelecionado={mesSelecionado}
            onUpdate={atualizarBill}
          />
        ))}
      </div>
    </main>
  );
}
