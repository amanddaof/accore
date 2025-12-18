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

export default function CardsDrawer({ open, onClose, cards = [], mes }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [pendentesGlobais, setPendentesGlobais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);

  function formatarMes(mesISO) {
    const [ano, mesStr] = mesISO.split("-");
    return `${nomesMeses[Number(mesStr) - 1]}/${ano.slice(2)}`;
  }

  const [mesFiltro, setMesFiltro] = useState(() =>
    mes ? formatarMes(mes) : formatarMes(new Date().toISOString().slice(0, 7))
  );

  useEffect(() => {
    if (mes) setMesFiltro(formatarMes(mes));
  }, [mes]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data_real: new Date().toISOString().slice(0, 10),
    parcelas: "1/1",
    quem: "Amanda",
    status: "Pendente",
    category_id: "",
    origem: "",
    mes: "" // 🔑 FATURA INFORMADA
  });

  useEffect(() => {
    getCategories().then(c => setCategories(c.filter(x => x.active)));
  }, []);

  const activeCard = cards[activeIndex] || null;

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

      const { data: dataMes, error: errMes } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("origem", activeCard.nome)
        .eq("mes", mesFiltro)
        .order("id", { ascending: false });

      if (errMes) console.error(errMes);

      const { data: dataPend, error: errPend } = await supabase
        .from("transactions")
        .select("*")
        .eq("origem", activeCard.nome)
        .eq("status", "Pendente");

      if (errPend) console.error(errPend);

      setTransactions(dataMes || []);
      setPendentesGlobais(dataPend || []);

      setForm(f => ({
        ...f,
        origem: activeCard.nome,
        mes: mesFiltro // 👈 pré-preenche a fatura atual
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

    const inserts = [];

    for (let i = parcelaAtual - 1; i < totalParcelas; i++) {
      const numeroParcela = i + 1;
      const dataParcela = addMeses(form.data_real, i);

      inserts.push({
        descricao: form.descricao,
        valor: Number(form.valor),
        data_real: dataParcela,
        parcelas: `${numeroParcela}/${totalParcelas}`,
        mes: form.mes, // 🔑 SEMPRE MANUAL
        quem: form.quem,
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

  function irProProximo() {
    setActiveIndex(i => (i < cards.length - 1 ? i + 1 : i));
  }

  function irProAnterior() {
    setActiveIndex(i => (i > 0 ? i - 1 : i));
  }

  function mesAnterior() {
    const [m, y] = mesFiltro.split("/");
    const base = new Date(2000 + Number(y), nomesMeses.indexOf(m));
    base.setMonth(base.getMonth() - 1);
    setMesFiltro(
      `${nomesMeses[base.getMonth()]}/${String(base.getFullYear()).slice(2)}`
    );
  }

  function mesProximo() {
    const [m, y] = mesFiltro.split("/");
    const base = new Date(2000 + Number(y), nomesMeses.indexOf(m));
    base.setMonth(base.getMonth() + 1);
    setMesFiltro(
      `${nomesMeses[base.getMonth()]}/${String(base.getFullYear()).slice(2)}`
    );
  }

  if (!open) return null;

  const prevIndex = activeIndex > 0 ? activeIndex - 1 : null;
  const nextIndex = activeIndex < cards.length - 1 ? activeIndex + 1 : null;

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
                <CreditCardFull card={cards[prevIndex]} />
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
                  if (info.offset.x < -80) irProProximo();
                  else if (info.offset.x > 80) irProAnterior();
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
                <CreditCardFull card={cards[nextIndex]} />
              </motion.div>
            )}
          </div>

          <div className="drawer-filter">
            <button onClick={mesAnterior}>◀</button>
            <strong>{mesFiltro}</strong>
            <button onClick={mesProximo}>▶</button>
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
              <input
                placeholder="Descrição"
                value={form.descricao}
                onChange={e =>
                  setForm({ ...form, descricao: e.target.value })
                }
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Valor da parcela"
                value={form.valor}
                onChange={e =>
                  setForm({ ...form, valor: e.target.value })
                }
                required
              />

              <input
                type="date"
                value={form.data_real}
                onChange={e =>
                  setForm({ ...form, data_real: e.target.value })
                }
                required
              />

              <input
                placeholder="Parcelas (3/10)"
                value={form.parcelas}
                onChange={e =>
                  setForm({ ...form, parcelas: e.target.value })
                }
                required
              />

              <input
                placeholder="Fatura (ex: Jan/26)"
                value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })}
                required
              />

              <select
                value={form.quem}
                onChange={e =>
                  setForm({ ...form, quem: e.target.value })
                }
              >
                <option>Amanda</option>
                <option>Celso</option>
                <option>Ambos</option>
                <option>Terceiros</option>
              </select>

              <select
                value={form.status}
                onChange={e =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option>Pendente</option>
                <option>Pago</option>
              </select>

              <select
                value={form.category_id}
                onChange={e =>
                  setForm({ ...form, category_id: e.target.value })
                }
                required
              >
                <option value="">Categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input value={form.origem} disabled />

              <button className="primary-btn" type="submit">
                Salvar compra
              </button>
            </form>
          )}

          {loading ? (
            <div className="card-transactions empty">
              Carregando...
            </div>
          ) : (
            <CardTransactions transactions={transactions} />
          )}
        </div>
      </aside>
    </div>
  );
}
