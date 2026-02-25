import { useEffect, useState } from "react";
import { buscarTodos } from "../../servicos/banco";
import { useMes } from "../../contextos/MesContexto";
import {
  extrairAnoEMes,
  calcularStatusMeta
} from "./logica/calculoEconomia";
import ResumoMeta from "./componentes/ResumoMeta";
import ListaEconomia from "./componentes/ListaEconomia";
import ModalNovaMeta from "./ModalNovaMeta";
import ModalNovoValor from "./ModalNovoValor";
import "./estilos/economia.css";

export default function Economia() {
  const { mesSelecionado } = useMes();

  const { ano, mes } = extrairAnoEMes(mesSelecionado) || {};

  const [meta, setMeta] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMeta, setModalMeta] = useState(false);
  const [modalValor, setModalValor] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);

        const metas = await buscarTodos("meta_economia");
        const economia = await buscarTodos("economia_anual");

        setMeta(
          metas.find(m => Number(m.ano) === Number(ano)) || null
        );

        setRegistros(
          economia.filter(e => Number(e.ano) === Number(ano))
        );

      } catch (error) {
        console.error("Erro ao carregar economia:", error);
      } finally {
        setLoading(false);
      }
    }

    if (ano) {
      carregar();
    }
  }, [ano]);

  if (loading) {
    return <main className="economia">Carregando…</main>;
  }

  const valorMeta = meta?.valor || 0;

  const status = calcularStatusMeta({
    anoSelecionado: ano,
    mesSelecionadoNumero: mes,
    registros,
    valorMeta
  });

  const totalAmanda = registros
    .filter(r => r.pessoa === "amanda")
    .reduce((acc, r) => acc + Number(r.economizado_real || 0), 0);

  const totalCelso = registros
    .filter(r => r.pessoa === "celso")
    .reduce((acc, r) => acc + Number(r.economizado_real || 0), 0);

  return (
    <main className="economia">

      <ResumoMeta
        meta={meta}
        totalGuardado={status.totalGuardado}
        totalAmanda={totalAmanda}
        totalCelso={totalCelso}
        statusMeta={status}
        abrirModalMeta={() => setModalMeta(true)}
      />

      <div className="economia-acoes">
        <button
          className="botao-primario"
          onClick={() => setModalValor(true)}
        >
          + Adicionar valor
        </button>
      </div>

      <ListaEconomia
        registros={registros}
        atualizarRegistro={(atualizado) =>
          setRegistros(prev =>
            prev.map(r => r.id === atualizado.id ? atualizado : r)
          )
        }
      />

      {modalMeta && (
        <ModalNovaMeta
          fechar={() => setModalMeta(false)}
          ano={ano}
          metaAtual={meta}
          aoSalvar={(nova) => setMeta(nova)}
        />
      )}

      {modalValor && (
        <ModalNovoValor
          fechar={() => setModalValor(false)}
          ano={ano}
          aoSalvar={(novo) =>
            setRegistros(prev => [...prev, novo])
          }
        />
      )}

    </main>
  );
}
