import { useEffect, useState } from "react";
import { supabase } from "../../../servicos/supabase";
import { gerarParcelas } from "../logica/gerarParcelas";
import money from "../../../utils/money";
import { formatDateLabel } from "../../../utils/formatDate";
import "../estilos/cartoes.css";

export default function CartaoExpandido({ cartao, mesFiltro, onVoltar }) {
  const [transacoes, setTransacoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loadingPagarTudo, setLoadingPagarTudo] = useState(false);

  const [novaCompra, setNovaCompra] = useState({
    descricao: "",
    valor: "",
    data_real: "",
    parcelas: "1/1",
    mes: mesFiltro,
    quem: "Amanda",
    status: "Pendente",
    categoria: ""
  });

  useEffect(() => {
    carregar();
    carregarCategorias();
  }, [cartao.nome, mesFiltro]);

  async function carregar() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("origem", cartao.nome)
      .eq("mes", mesFiltro)
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

    setTransacoes(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: "Pago" } : t
      )
    );
  }

  async function marcarTudoComoPago() {
    const pendentesDoMes = transacoes.filter(
      t => t.status === "Pendente"
    );

    if (pendentesDoMes.length === 0) return;

    const confirmar = window.confirm(
      `Deseja marcar ${pendentesDoMes.length} compras como pagas?`
    );

    if (!confirmar) return;

    setLoadingPagarTudo(true);

    await supabase
      .from("transactions")
      .update({ status: "Pago" })
      .eq("origem", cartao.nome)
      .eq("mes", mesFiltro)
      .eq("status", "Pendente");

    setTransacoes(prev =>
      prev.map(t =>
        t.status === "Pendente" ? { ...t, status: "Pago" } : t
      )
    );

    setLoadingPagarTudo(false);
  }

  async function excluirTransacao(transacao) {
  const confirmar = window.confirm(
    `Tem certeza que deseja excluir:\n\n` +
    `${transacao.descricao}\n` +
    `Parcela: ${transacao.parcelas}\n` +
    `Valor: ${money(transacao.valor)}`
  );

  if (!confirmar) return;

  await supabase
    .from("transactions")
    .delete()
    .eq("id", transacao.id);

  setTransacoes(prev =>
    prev.filter(t => t.id !== transacao.id)
  );
}

  function iniciarEdicao(transacao) {
    setModoEdicao(true);
    setIdEdicao(transacao.id);

    setNovaCompra({
      descricao: transacao.descricao,
      valor: transacao.valor,
      data_real: transacao.data_real,
      parcelas: transacao.parcelas,
      mes: transacao.mes,
      quem: transacao.quem,
      status: transacao.status,
      categoria: transacao.category_id
    });

    setModalAberto(true);
  }

  async function salvarCompra() {
    if (
      !novaCompra.descricao ||
      !novaCompra.valor ||
      !novaCompra.data_real ||
      !novaCompra.mes
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (modoEdicao) {
      const { error } = await supabase
        .from("transactions")
        .update({
          descricao: novaCompra.descricao,
          valor: Number(novaCompra.valor),
          data_real: novaCompra.data_real,
          mes: novaCompra.mes,
          quem: novaCompra.quem,
          status: novaCompra.status,
          category_id: novaCompra.categoria
        })
        .eq("id", idEdicao);

      if (!error) {
        setModalAberto(false);
        setModoEdicao(false);
        setIdEdicao(null);
        carregar();
      }

      return;
    }

    let compras;

    try {
      compras = gerarParcelas(novaCompra, cartao.nome);
    } catch (err) {
      alert(err.message);
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .insert(compras);

    if (!error) {
      setModalAberto(false);
      setNovaCompra({
        descricao: "",
        valor: "",
        data_real: "",
        parcelas: "1/1",
        mes: mesFiltro,
        quem: "Amanda",
        status: "Pendente",
        categoria: ""
      });
      carregar();
    }
  }

  function agruparPorData(lista) {
    return lista.reduce((acc, transacao) => {
      const chave = transacao.data_real || "SEM_DATA";
      if (!acc[chave]) acc[chave] = [];
      acc[chave].push(transacao);
      return acc;
    }, {});
  }

  const pendentes = transacoes.filter(t => t.status === "Pendente");
  const pagas = transacoes.filter(t => t.status === "Pago");
  const quantidadePendentes = pendentes.length;

  const pendentesAgrupados = agruparPorData(pendentes);
  const pagasAgrupados = agruparPorData(pagas);

  const totalFatura = pendentes.reduce((acc, t) => {
    const valor = Number(t.valor || 0);
    return acc + (t.quem === "Ambos" ? valor * 2 : valor);
  }, 0);

  return (
    <div className="expandido-container">
      <button className="botao-voltar" onClick={onVoltar}>
        ← Voltar
      </button>

      <div className="topo-expandido">
        <h2 className="expandido-titulo">{cartao.nome}</h2>

        <div className="acoes-topo">
          <button
            className="btn-secundario"
            onClick={marcarTudoComoPago}
            disabled={quantidadePendentes === 0 || loadingPagarTudo}
          >
            {loadingPagarTudo
              ? "Processando..."
              : quantidadePendentes > 0
                ? `✓ Marcar ${quantidadePendentes} como pago`
                : "✓ Nada pendente"}
          </button>

          <button
            className="btn-primario"
            onClick={() => {
              setModoEdicao(false);
              setNovaCompra({
                descricao: "",
                valor: "",
                data_real: "",
                parcelas: "1/1",
                mes: mesFiltro,
                quem: "Amanda",
                status: "Pendente",
                categoria: ""
              });
              setModalAberto(true);
            }}
          >
            + Nova compra
          </button>
        </div>
      </div>

      <div className="expandido-resumo">
        <div>
          <span>Limite</span>
          <strong>{money(cartao.limite)}</strong>
        </div>
        <div>
          <span>Fatura</span>
          <strong>{money(totalFatura)}</strong>
        </div>
      </div>

      {/* LISTAS (inalteradas) */}

      {/* PENDENTES */}
      <div className="lista-bloco">
        <h4>Pendentes</h4>

        {Object.entries(pendentesAgrupados).map(([data, lista]) => (
          <div key={data} className="grupo-dia">
            <div className="grupo-data">
              {formatDateLabel(data)}
            </div>

            {lista.map(t => (
              <div key={t.id} className="linha-transacao pendente">
                <div className="info-esquerda">
                  <strong>{t.descricao}</strong>
                  <div className="linha-secundaria">
                    <span className={`tag-pessoa ${t.quem.toLowerCase()}`}>
                      {t.parcelas} • {t.quem}
                    </span>
                  </div>
                </div>

                <div className="lado-direito">
                  <span className="valor">{money(t.valor)}</span>

                  <div className="acoes">
                    {t.status === "Pendente" && (
                      <img
                        src="/icone/verificar.png"
                        alt="Marcar como pago"
                        onClick={() => marcarComoPago(t.id)}
                      />
                    )}
                    <img
                      src="/icone/editar.png"
                      alt="Editar"
                      onClick={() => iniciarEdicao(t)}
                    />
                    <img
                      src="/icone/excluir.png"
                      alt="Excluir"
                      onClick={() => excluirTransacao(t)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* PAGAS (inalterado) */}
      {pagas.length > 0 && (
        <div className="lista-bloco pagas">
          <h4>Pagas</h4>

          {Object.entries(pagasAgrupados).map(([data, lista]) => (
            <div key={data} className="grupo-dia">
              <div className="grupo-data">
                {formatDateLabel(data)}
              </div>

              {lista.map(t => (
                <div key={t.id} className="linha-transacao paga">
                  <div className="info-esquerda">
                    <strong>{t.descricao}</strong>
                    <div className="linha-secundaria">
                      <span className={`tag-pessoa ${t.quem.toLowerCase()}`}>
                        {t.parcelas} • {t.quem}
                      </span>
                    </div>
                  </div>

                  <div className="lado-direito">
                    <span className="valor">{money(t.valor)}</span>

                    <div className="acoes">
                      <img
                        src="/icone/editar.png"
                        alt="Editar"
                        onClick={() => iniciarEdicao(t)}
                      />
                      <img
                        src="/icone/excluir.png"
                        alt="Excluir"
                        onClick={() => excluirTransacao(t)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* MODAL inalterado */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{modoEdicao ? "Editar compra" : "Nova compra"}</h3>

            <input
              placeholder="Descrição"
              value={novaCompra.descricao}
              onChange={e =>
                setNovaCompra({ ...novaCompra, descricao: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Valor da parcela"
              value={novaCompra.valor}
              onChange={e =>
                setNovaCompra({ ...novaCompra, valor: e.target.value })
              }
            />

            <input
              type="date"
              value={novaCompra.data_real}
              onChange={e =>
                setNovaCompra({ ...novaCompra, data_real: e.target.value })
              }
            />

            <input
              placeholder="Ex: Fev/26"
              value={novaCompra.mes}
              onChange={e =>
                setNovaCompra({ ...novaCompra, mes: e.target.value })
              }
            />

            <input
              type="text"
              value={novaCompra.parcelas}
              disabled={modoEdicao}
              onChange={e =>
                setNovaCompra({ ...novaCompra, parcelas: e.target.value })
              }
            />

            <select
              value={novaCompra.quem}
              onChange={e =>
                setNovaCompra({ ...novaCompra, quem: e.target.value })
              }
            >
              <option>Amanda</option>
              <option>Celso</option>
              <option>Ambos</option>
              <option>Terceiros</option>
            </select>

            <select
              value={novaCompra.status}
              onChange={e =>
                setNovaCompra({ ...novaCompra, status: e.target.value })
              }
            >
              <option>Pendente</option>
              <option>Pago</option>
            </select>

            <select
              value={novaCompra.categoria}
              onChange={e =>
                setNovaCompra({
                  ...novaCompra,
                  categoria: Number(e.target.value)
                })
              }
            >
              <option value="">Categoria</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="modal-botoes">
              <button onClick={() => setModalAberto(false)}>
                Cancelar
              </button>

              <button onClick={salvarCompra}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
