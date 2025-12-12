import { useState } from "react";

export default function NewTransaction() {

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    pessoa: "Amanda",
    categoria: "",
    data: new Date().toISOString().slice(0,10)
  });

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    console.log("NOVO LANÇAMENTO:", form);
    alert("Por enquanto estamos só salvando no console 🙂");
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
          value={form.pessoa}
          onChange={e => setField("pessoa", e.target.value)}
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

        <input
          type="date"
          value={form.data}
          onChange={e => setField("data", e.target.value)}
        />

        <button type="submit">Salvar lançamento</button>

      </form>
    </div>
  );
}
