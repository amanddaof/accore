import { useState } from "react";
import { atualizar } from "../../../servicos/banco";
import money from "../../../utils/money";

export default function ItemMes({ registro, atualizarRegistro }) {

  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(registro.economizado_real);

  async function salvar() {
    const atualizado = await atualizar("economia_anual", registro.id, {
      economizado_real: Number(valor)
    });

    if (atualizado) {
      atualizarRegistro(atualizado);
      setEditando(false);
    }
  }

  return (
    <div className="item-mes">
      <span>{registro.mes}</span>

      {!editando ? (
        <span onClick={() => setEditando(true)}>
          {money(registro.economizado_real)}
        </span>
      ) : (
        <>
          <input
            type="number"
            value={valor}
            onChange={e => setValor(e.target.value)}
          />
          <button onClick={salvar}>Salvar</button>
        </>
      )}
    </div>
  );
}
