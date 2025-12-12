import { useEffect, useState } from "react";
import {
  getCategories,
  addCategory,
  updateCategory
} from "../../services/categories.service";
import "./Categories.css";

export default function Categories() {

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6c63ff");

  const [editing, setEditing] = useState(null);

  async function load() {
    const data = await getCategories();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!name) return;

    try {
      await addCategory({ name, color });
      setName("");
      setColor("#6c63ff");
      load();
    } catch (e) {
      alert("Erro ao salvar categoria — veja o console");
      console.error(e);
    }
  }

  async function toggle(c) {
    await updateCategory(c.id, { active: !c.active });
    load();
  }

  function startEdit(c) {
    setEditing({ ...c });
  }

  async function saveEdit() {
    try {
      await updateCategory(editing.id, {
        name: editing.name,
        color: editing.color
      });
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar edição");
    }
  }

  return (
    <div className="card glass categories-page">

      <h2>Categorias</h2>

      {/* NOVA CATEGORIA */}
      <div className="new-category">
        <input
          placeholder="Nome da categoria"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
        />
        <button onClick={save}>Adicionar</button>
      </div>

      {/* LISTA */}
      <div className="categories-list">
        {categories.map(c => (
          <div
            key={c.id}
            className={`category-card ${!c.active ? "inactive" : ""}`}
          >
            <div className="color-dot" style={{ background: c.color }} />
            <span className="category-name">{c.name}</span>

            <div className="category-actions">
              <button className="btn-edit" onClick={() => startEdit(c)}>
                Editar
              </button>

              <button className="btn-toggle" onClick={() => toggle(c)}>
                {c.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITAR */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Editar categoria</h3>

            <input
              type="text"
              value={editing.name}
              onChange={e =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              type="color"
              value={editing.color}
              onChange={e =>
                setEditing({ ...editing, color: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn-save" onClick={saveEdit}>
                Salvar
              </button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
