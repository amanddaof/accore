import { useEffect, useState } from "react";
import { addSalary, updateSalary, deleteSalary } from "../../services/salary.service";

export function SalaryModal({ onClose, onSave, edit }) {

  const [data, setData] = useState("");
  const [quem, setQuem] = useState("amanda");
  const [valor, setValor] = useState("");

  // quando for edição, preenche
  useEffect(() => {
    if (edit) {
      setData(edit.data.slice(0,7)); // YYYY-MM
      setQuem(edit.quem.toLowerCase());
      setValor(edit.valor);
    }
  }, [edit]);

  async function salvar() {
    if (!data || !valor) return alert("Preencha tudo.");

    const payload = {
      data: data + "-01",
      quem,
      valor: Number(valor)
    };

    if (edit) {
      await updateSalary(edit.id, payload);
    } else {
      await addSalary(payload);
    }

    onSave();
    onClose();
  }

  async function excluir() {
    if (!edit) return;
    if (!window.confirm("Deseja excluir este salário?")) return;

    await deleteSalary(edit.id);
    onSave();
    onClose();
  }

  return (
    <div className="modal-bg">
      <div className="modal">

        <h3>{edit ? "Editar salário" : "Novo salário"}</h3>

        <label>Mês / Ano</label>
        <input type="month" value={data} onChange={e => setData(e.target.value)} />

        <label>Pessoa</label>
        <select value={quem} onChange={e => setQuem(e.target.value)}>
          <option value="amanda">Amanda</option>
          <option value="celso">Celso</option>
        </select>

        <label>Valor</label>
        <input type="number" value={valor} onChange={e => setValor(e.target.value)} />

        <div className="modal-actions">
          <button className="btn-primary" onClick={salvar}>
            {edit ? "Salvar alterações" : "Salvar"}
          </button>

          {edit && (
            <button
              className="btn-secondary"
              style={{ color: "#ff6b6b" }}
              onClick={excluir}
            >
              Excluir
            </button>
          )}

          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
