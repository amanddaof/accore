import { useState, useEffect } from "react";
import { buscarTodos } from "../../../servicos/banco";

export default function ModalNovaReserva({
  aoFechar,
  aoSalvar,
  reservaInicial = null
}) {

  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data_real: "",
    mes: "",
    recorrencia: "Mensal",
    parcelas: "1/1",
    quem: "",
    origem: "",
    quem_paga: "",
    category_id: ""
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    if (reservaInicial) {
      setForm({
        ...reservaInicial
      });
    }
  }, [reservaInicial]);

  async function carregarCategorias() {
    const dados = await buscarTodos("categorias");
    setCategorias(dados || []);
  }

  function handleSubmit(e) {
    e.preventDefault();
    aoSalvar(form);
  }

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <h3>{reservaInicial ? "Editar Reserva" : "Nova Reserva"}</h3>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Descrição"
            value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Valor"
            value={form.valor}
            onChange={e => setForm({ ...form, valor: e.target.value })}
            required
          />

          <input
            type="date"
            value={form.data_real}
            onChange={e => setForm({ ...form, data_real: e.target.value })}
            required
          />

          <input
            placeholder="Mês (Jan/26)"
            value={form.mes}
            onChange={e => setForm({ ...form, mes: e.target.value })}
            required
          />

          <select
            value={form.recorrencia}
            onChange={e => setForm({ ...form, recorrencia: e.target.value })}
          >
            <option>Mensal</option>
            <option>Bimestral</option>
            <option>Trimestral</option>
            <option>Parcelado</option>
            <option>Única</option>
          </select>

          {form.recorrencia === "Parcelado" && (
            <input
              placeholder="Parcelas (ex: 1/12)"
              value={form.parcelas}
              onChange={e => setForm({ ...form, parcelas: e.target.value })}
              required
            />
          )}

          <select
            value={form.quem}
            onChange={e => setForm({ ...form, quem: e.target.value })}
            required
          >
            <option value="">Quem?</option>
            <option>Amanda</option>
            <option>Celso</option>
            <option>Ambos</option>
          </select>

          <select
            value={form.origem}
            onChange={e => setForm({ ...form, origem: e.target.value })}
            required
          >
            <option value="">Origem</option>
            <option>Externo</option>
            <option>NU Amanda</option>
            <option>NU Celso</option>
            <option>SI Amanda</option>
            <option>BB Celso</option>
          </select>

          {form.origem === "Externo" && (
            <select
              value={form.quem_paga}
              onChange={e => setForm({ ...form, quem_paga: e.target.value })}
              required
            >
              <option value="">Quem paga?</option>
              <option>Amanda</option>
              <option>Celso</option>
            </select>
          )}

          <select
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: e.target.value })}
            required
          >
            <option value="">Categoria</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="modal-botoes">
            <button
              type="button"
              onClick={aoFechar}
              className="botao-secundario"
            >
              Cancelar
            </button>

            <button type="submit" className="botao-primario">
              Salvar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}