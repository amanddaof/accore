export default function ModalNovaDespesaExterno({
  aberto,
  novaDespesa,
  setNovaDespesa,
  categorias,
  onSalvar,
  onCancelar,
  modoEdicao
}) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{modoEdicao ? "Editar despesa" : "Nova despesa externa"}</h3>

        <input
          placeholder="Descrição"
          value={novaDespesa.descricao}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Valor"
          value={novaDespesa.valor}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, valor: e.target.value })
          }
        />

        <input
          type="date"
          value={novaDespesa.data_real}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, data_real: e.target.value })
          }
        />

        <input
          placeholder="Ex: Fev/26"
          value={novaDespesa.mes}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, mes: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Ex: 1/3"
          value={novaDespesa.parcelas}
          disabled={modoEdicao}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, parcelas: e.target.value })
          }
        />

        <select
          value={novaDespesa.quem}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, quem: e.target.value })
          }
        >
          <option>Amanda</option>
          <option>Celso</option>
          <option>Ambos</option>
          <option>Terceiros</option>
        </select>

        <select
          value={novaDespesa.quem_paga}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, quem_paga: e.target.value })
          }
        >
          <option>Amanda</option>
          <option>Celso</option>
        </select>

        <select
          value={novaDespesa.status}
          onChange={e =>
            setNovaDespesa({ ...novaDespesa, status: e.target.value })
          }
        >
          <option>Pendente</option>
          <option>Pago</option>
        </select>

        <select
          value={novaDespesa.categoria}
          onChange={e =>
            setNovaDespesa({
              ...novaDespesa,
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
          <button onClick={onCancelar}>Cancelar</button>
          <button onClick={onSalvar}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
