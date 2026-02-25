import { useEffect, useState } from "react";
import { supabase } from "../../servicos/supabase";
import { useMes } from "../../contextos/MesContexto";
import ListaExterno from "./componentes/ListaExterno";
import ModalNovaDespesaExterno from "./componentes/ModalNovaDespesaExterno";
import { gerarParcelasExterno } from "./logica/gerarParcelasExterno";
import { calcularTotaisExterno } from "./logica/calcularTotaisExterno";
import money from "../../utils/money";
import "./estilos/externo.css";

export default function Externo() {

  const { mesSelecionado } = useMes();

  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);

  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    valor: "",
    data_real: "",
    parcelas: "1/1",
    mes: mesSelecionado,
    quem: "Amanda",
    quem_paga: "Amanda",
    status: "Pendente",
    categoria: ""
  });

  // ✅ Totais isolados na lógica
  const { totalAmanda, totalCelso, totalGeral } =
    calcularTotaisExterno(transacoes);

  useEffect(() => {
    carregar();
    carregarCategorias();
  }, [mesSelecionado]);

  async function carregar() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("origem", "Externo")
      .eq("mes", mesSelecionado)
      .order("data_real", { ascending: false })
      .order("id", { ascending: false });

    setTransacoes(data || []);
  }

  async function carregarCategorias() {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");

    setCategorias(data || []);
  }

  async function marcarComoPago(id) {
    await supabase
      .from("transactions")
      .update({ status: "Pago" })
      .eq("id", id);

    carregar();
  }

  async function excluirTransacao(transacao) {
    const confirmar = window.confirm(
      `Deseja excluir ${transacao.descricao}?`
    );

    if (!confirmar) return;

    await supabase
      .from("transactions")
      .delete()
      .eq("id", transacao.id);

    carregar();
  }

  function iniciarEdicao(transacao) {
    setModoEdicao(true);
    setIdEdicao(transacao.id);
    setNovaDespesa(transacao);
    setModalAberto(true);
  }

  async function salvarDespesa() {

    if (modoEdicao) {
      await supabase
        .from("transactions")
        .update({
          descricao: novaDespesa.descricao,
          valor: novaDespesa.valor,
          data_real: novaDespesa.data_real,
          mes: novaDespesa.mes,
          quem: novaDespesa.quem,
          quem_paga: novaDespesa.quem_paga,
          status: novaDespesa.status,
          category_id: novaDespesa.categoria
        })
        .eq("id", idEdicao);

      setModoEdicao(false);
      setModalAberto(false);
      carregar();
      return;
    }

    let despesas;

    try {
      despesas = gerarParcelasExterno(novaDespesa);
    } catch (err) {
      alert(err.message);
      return;
    }

    await supabase
      .from("transactions")
      .insert(despesas);

    setModalAberto(false);

    setNovaDespesa({
      descricao: "",
      valor: "",
      data_real: "",
      parcelas: "1/1",
      mes: mesSelecionado,
      quem: "Amanda",
      quem_paga: "Amanda",
      status: "Pendente",
      categoria: ""
    });

    carregar();
  }

  return (
    <div className="externo-container">

      <div className="topo-externo">

        <h2>Despesas Externas</h2>

        <div className="resumo-externo">
          <div className="card-resumo total">
            <span>Total do mês</span>
            <strong>{money(totalGeral)}</strong>
          </div>

          <div className="card-resumo amanda">
            <span>Amanda</span>
            <strong>{money(totalAmanda)}</strong>
          </div>

          <div className="card-resumo celso">
            <span>Celso</span>
            <strong>{money(totalCelso)}</strong>
          </div>
        </div>

        <button
          className="btn-primario"
          onClick={() => {
            setModoEdicao(false);
            setNovaDespesa({
              descricao: "",
              valor: "",
              data_real: "",
              parcelas: "1/1",
              mes: mesSelecionado,
              quem: "Amanda",
              quem_paga: "Amanda",
              status: "Pendente",
              categoria: ""
            });
            setModalAberto(true);
          }}
        >
          + Nova despesa
        </button>

      </div>

      <ListaExterno
        transacoes={transacoes}
        onEditar={iniciarEdicao}
        onExcluir={excluirTransacao}
        onMarcarPago={marcarComoPago}
      />

      <ModalNovaDespesaExterno
        aberto={modalAberto}
        novaDespesa={novaDespesa}
        setNovaDespesa={setNovaDespesa}
        categorias={categorias}
        onSalvar={salvarDespesa}
        onCancelar={() => setModalAberto(false)}
        modoEdicao={modoEdicao}
      />

    </div>
  );
}