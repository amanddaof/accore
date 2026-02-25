import { useEffect, useState } from "react";
import { inserir, atualizar, remover } from "../../servicos/banco";

export default function ModalSalario({
  edit,
  fechar,
  atualizar: recarregar
}) {

  const [data, setData] = useState("");
  const [quem, setQuem] = useState("amanda");
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (edit) {
      setData(edit.data.slice(0,7));
      setQuem(edit.quem.toLowerCase());
      setValor(edit.valor);
    }
  }, [edit]);

  async function salvar() {
    if (!data || !valor) return;

    const payload = {
      data: data + "-01",
      quem,
      valor: Number(valor)
    };

    if (edit) {
      await atualizar("historico_salarios", edit.id, payload);
    } else {
      await inserir("historico_salarios", payload);
    }

    recarregar();
    fechar();
  }

  async function excluir() {
    if (!edit) return;
    await remover("historico_salarios", edit.id);
    recarregar();
    fechar();
  }

  return (
    <div className="overlay-modal">
      <div className="modal-salario">

        <h3>{edit ? "Editar salário" : "Novo salário"}</h3>

        <input
          type="month"
          value={data}
          onChange={e => setData(e.target.value)}
        />

        <select
          value={quem}
          onChange={e => setQuem(e.target.value)}
        >
          <option value="amanda">Amanda</option>
          <option value="celso">Celso</option>
        </select>

        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="Valor"
        />

        <div className="acoes-modal">
          <button className="btn-primario" onClick={salvar}>
            Salvar
          </button>

          {edit && (
            <button
              className="btn-secundario perigo"
              onClick={excluir}
            >
              Excluir
            </button>
          )}

          <button
            className="btn-secundario"
            onClick={fechar}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
