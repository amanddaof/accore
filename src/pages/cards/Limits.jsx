import { useEffect, useState } from "react";
import { getCards, salvarLimite } from "../../services/cards.service";
import { money } from "../../utils/money";
import "./Limits.css";

export default function Limits() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [novoLimite, setNovoLimite] = useState("");

  async function carregar() {
    setLoading(true);
    const data = await getCards();
    setCards(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    if (!editing) return;
    await salvarLimite(editing.id, Number(novoLimite));
    setEditing(null);
    setNovoLimite("");
    carregar();
  }

  if (loading) return <div className="card glass">Carregando cartões...</div>;

  return (
    <div className="card glass limits-page">

      <div className="limits-header">
        <h2>Limites dos Cartões</h2>
      </div>

      <div className="limits-list">
        {cards.map(c => (
          <div key={c.id} className="limit-row">

            <div className="limit-info">
              <strong>{c.nome}</strong>
              <span>{money(c.limite || 0)}</span>
            </div>

            <button
              className="btn-edit"
              onClick={() => {
                setEditing(c);
                setNovoLimite(c.limite || "");
              }}
            >
              Editar
            </button>

          </div>
        ))}
      </div>

      {editing && (
        <div className="limits-modal-bg">
          <div className="limits-modal">
            <h3>{editing.nome}</h3>

            <label>Novo limite</label>
            <input
              type="number"
              value={novoLimite}
              onChange={e => setNovoLimite(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-primary" onClick={salvar}>
                Salvar
              </button>

              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
