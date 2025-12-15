import { useEffect, useState } from "react";
import { createTransaction } from "../services/transactions.service";
import { getCards } from "../services/cards.service";

export default function NewTransaction() {
  const [cards, setCards] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    quem: "Amanda",
    categoria: "",
    origem: "",
    data_real: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    getCards().then(setCards);
  }, []);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();

    await createTransaction(form);

    alert("Lançamento salvo com fatura correta ✅");
  }

  return (
    <div className="glass card">
      <h2>Novo lançamento</h2>

      <form className="form" onSubmit={submit}>
        <input
          placeholder="Descrição"
          value={form.descricao}
          onChange={e => setField("descricao", e.target.value)}
          required
        />

        <input
          type="number"
          step="0.01"
          placeholder="Valor"
          value={form.valor}
          onChange={e => setField("valor", e.target.value)}
          required
        />

        <select
          value={form.quem}
          onChange={e => setField("quem", e.target.value)}
        >
          <option>Amanda</option>
          <option>Celso</option>
          <option>Ambos</option>
        </select>

        <input
          placeholder="Categoria"
          value={form.categoria}
          onChange={e => setField("categoria", e.target.value)}
          required
        />

        {/* 🔑 ORIGEM / CARTÃO */}
        <select
          value={form.origem}
          onChange={e => setField("origem", e.target.value)}
          required
        >
          <option value="">Selecione o cartão</option>
          {cards.map(c => (
            <option key={c.id} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>

        {/* 📅 DATA REAL */}
        <input
          type="date"
          value={form.data_real}
          onChange={e => setField("data_real", e.target.value)}
        />

        <button type="submit">Salvar lançamento</button>
      </form>
    </div>
  );
}
