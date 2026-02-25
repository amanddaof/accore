import { useState } from "react";
import { atualizar } from "../../../servicos/banco";
import money from "../../../utils/money";

export default function BillAtual({ bill, onUpdate }) {
  const [editando, setEditando] = useState(false);
  const [valorReal, setValorReal] = useState(bill.valor_real ?? "");
  const [salvando, setSalvando] = useState(false);

  const pago = bill.status === "Pago";

  const valorMostrar =
    Number(bill.valor_real) > 0
      ? bill.valor_real
      : bill.valor_previsto;

  async function salvarValorReal() {
    setSalvando(true);

    const data = await atualizar("contas", bill.id, {
      valor_real: valorReal === "" ? null : Number(valorReal),
    });

    setSalvando(false);
    if (!data) return;

    onUpdate(data);
    setEditando(false);
  }

  async function marcarComoPago() {
    const data = await atualizar("contas", bill.id, {
      status: "Pago",
    });

    if (!data) return;

    onUpdate(data);
  }

  return (
    <div className={`bill-card ${pago ? "pago" : ""}`}>
      <div className="bill-top">
        <span className="bill-mes">{bill.mes}</span>
        <span className={`bill-status ${pago ? "ok" : "pendente"}`}>
          {pago ? "Pago" : "Pendente"}
        </span>
      </div>

      {pago ? (
        <div className="bill-valor">
          {money(valorMostrar)}
        </div>
      ) : (
        <>
          {!editando ? (
            <div
              className="bill-valor editavel"
              onClick={() => setEditando(true)}
            >
              {money(valorMostrar)}
              <span className="edit-icon">✏️</span>
            </div>
          ) : (
            <div className="bill-edit">
              <input
                type="number"
                step="0.01"
                value={valorReal}
                onChange={e => setValorReal(e.target.value)}
                autoFocus
              />
              <button onClick={salvarValorReal} disabled={salvando}>
                Salvar
              </button>
            </div>
          )}

          <button className="bill-pagar" onClick={marcarComoPago}>
            Marcar como pago
          </button>
        </>
      )}
    </div>
  );
}
