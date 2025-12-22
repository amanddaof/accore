import "./CardsDrawer.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import CreditCardFull from "./CreditCardFull";
import CardTransactions from "./CardTransactions";
import { money } from "../utils/money";
import { motion } from "framer-motion";
import { getCategories } from "../services/categories.service";

const nomesMeses = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// 🔒 ORDEM FIXA DOS CARTÕES VISÍVEIS
const ORDEM_CARTOES = [
  "NU Amanda",
  "NU Celso",
  "SI Amanda",
  "BB Celso"
];

function resolverQuemPagaPorCartao(origem) {
  if (!origem) return null;
  if (origem.includes("Amanda")) return "Amanda";
  if (origem.includes("Celso")) return "Celso";
  return null;
}

function alterarMes(delta) {
  const [mesAbrev, anoAbrev] = mesFiltro.split("/");
  const mesIndex = nomesMeses.indexOf(mesAbrev);
  const ano = Number("20" + anoAbrev);

  const data = new Date(ano, mesIndex, 1);
  data.setMonth(data.getMonth() + delta);

  const novoMes = `${nomesMeses[data.getMonth()]}/${String(
    data.getFullYear()
  ).slice(2)}`;

  setMesFiltro(novoMes);
}

export default function CardsDrawer({ open, onClose, cards = [], mes }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [pendentesGlobais, setPendentesGlobais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);

  // ✅ cartões visíveis, filtrados e ordenados
  const cardsVisiveis = ORDEM_CARTOES
    .map(nome => cards.find(c => c.nome === nome))
    .filter(Boolean);

  // proteção se mudar quantidade de cartões
  useEffect(() => {
    if (activeIndex >= cardsVisiveis.length) {
      setActiveIndex(0);
    }
  }, [cardsVisiveis.length]);

  function formatarMes(mesISO) {
    const [ano, mesStr] = mesISO.split("-");
    return `${nomesMeses[Number(mesStr) - 1]}/${ano.slice(2)}`;
  }

  const [mesFiltro, setMesFiltro] = useState(
    mes
      ? formatarMes(mes)
      : formatarMes(new Date().toISOString().slice(0, 7))
  );

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data_real: new Date().toISOString().slice(0, 10),
    parcelas: "1/1",
    quem: "Amanda",
    status: "Pendente",
    category_id: "",
    origem: "",
    mes: ""
  });

  useEffect(() => {
    getCategories().then(c => setCategories(c.filter(x => x.active)));
  }, []);

  const activeCard = cardsVisiveis[activeIndex] || null;

  const totalFatura = transactions
    .filter(t => (t.status || "").toLowerCase() === "pendente")
    .reduce((sum, t) => {
      const v = Number(t.valor);
      if (isNaN(v)) return sum;
      const multiplicador =
        (t.quem || "").toLowerCase() === "ambos" ? 2 : 1;
      return sum + v * multiplicador;
    }, 0);

  useEffect(() => {
    if (!open || !activeCard) return;

    async function loadData() {
      setLoading(true);

      const { data: dataMes } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("origem", activeCard.nome)
        .eq("mes", mesFiltro)
        .order("id", { ascending: false });

      const { data: dataPend } = await supabase
        .from("transactions")
        .select("*")
        .eq("origem", activeCard.nome)
        .eq("status", "Pendente");

      setTransactions(dataMes || []);
      setPendentesGlobais(dataPend || []);

      setForm(f => ({
        ...f,
        origem: activeCard.nome,
        mes: mesFiltro
      }));

      setLoading(false);
    }

    loadData();
  }, [open, activeCard, mesFiltro]);

  function addMeses(dataISO, qtdMeses) {
    const [ano, mesStr, dia] = dataISO.split("-").map(Number);
    const d = new Date(ano, mesStr - 1, dia);
    d.setMonth(d.getMonth() + qtdMeses);
    return d.toISOString().slice(0, 10);
  }

  async function salvarCompra(e) {
    e.preventDefault();

    const [parcelaAtual, totalParcelas] =
      form.parcelas.split("/").map(Number);

    if (!totalParcelas || parcelaAtual > totalParcelas) {
      alert("Parcelas inválidas. Ex: 3/10");
      return;
    }

    if (!form.mes) {
      alert("Informe a fatura (ex: Jan/26)");
      return;
    }

    const quemPagaCartao = resolverQuemPagaPorCartao(form.origem);
    const inserts = [];

    for (let i = parcelaAtual - 1; i < totalParcelas; i++) {
      const numeroParcela = i + 1;
      const dataParcela = addMeses(form.data_real, i);

      inserts.push({
        descricao: form.descricao,
        valor: Number(form.valor),
        data_real: dataParcela,
        parcelas: `${numeroParcela}/${totalParcelas}`,
        mes: form.mes,
        quem: form.quem,
        quem_paga: quemPagaCartao,
        status: form.status,
        origem: form.origem,
        category_id: form.category_id || null
      });
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert(inserts)
      .select("*");

    if (error) {
      alert("Erro ao salvar compra");
      console.error(error);
      return;
    }

    setTransactions(prev => [data[0], ...prev]);
    setPendentesGlobais(prev => [...prev, ...data]);

    setForm(f => ({
      ...f,
      descricao: "",
      valor: "",
      parcelas: "1/1",
      category_id: ""
    }));

    setShowForm(false);
  }

  if (!open) return null;

  const prevIndex = activeIndex > 0 ? activeIndex - 1 : null;
  const nextIndex =
    activeIndex < cardsVisiveis.length - 1 ? activeIndex + 1 : null;

  return (
    <div className="drawer-overlay">
      <aside className="drawer">
        <div className="drawer-header">
          <h2>Cartões</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">
          <div className="cards-stack-fm">
            {prevIndex !== null && (
              <motion.div className="card-ghost left">
                <CreditCardFull card={cardsVisiveis[prevIndex]} />
              </motion.div>
            )}

            {activeCard && (
              <motion.div
                key={activeCard.id}
                className="card-main"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80)
                    setActiveIndex(i => Math.min(i + 1, cardsVisiveis.length - 1));
                  else if (info.offset.x > 80)
                    setActiveIndex(i => Math.max(i - 1, 0));
                }}
              >
                <CreditCardFull
                  card={activeCard}
                  transactions={transactions}
                  pendentesGlobais={pendentesGlobais}
                />
              </motion.div>
            )}

            {nextIndex !== null && (
              <motion.div className="card-ghost right">
                <CreditCardFull card={cardsVisiveis[nextIndex]} />
              </motion.div>
            )}
          </div>

          <div className="drawer-filter">
            <button onClick={() => alterarMes(-1)}>◀</button>
            <strong>{mesFiltro}</strong>
            <button onClick={() => alterarMes(1)}>▶</button>
          </div>

          <div className="drawer-total">
            Total da fatura: <strong>{money(totalFatura)}</strong>
          </div>

          <button
            className="primary-btn"
            onClick={() => setShowForm(v => !v)}
          >
            + Nova compra
          </button>

          {showForm && (
            <form className="purchase-form" onSubmit={salvarCompra}>
              {/* formulário mantido igual */}
            </form>
          )}

          {loading ? (
            <div className="card-transactions empty">Carregando...</div>
          ) : (
            <CardTransactions transactions={transactions} />
          )}
        </div>
      </aside>
    </div>
  );
}


