import "./CategoriesPanel.css";
import { money } from "../utils/money";

export default function CategoriesPanel({ categorias }) {

  const lista = categorias?.ambos || [];

  if (!lista.length) {
    return (
      <div style={{ opacity: .6 }}>
        Nenhuma categoria registrada.
      </div>
    );
  }

  const maior = Math.max(...lista.map(i => i.valor || 0));

  return (
    <div className="categories-panel">
      <div className="section-title">Categorias do mês</div>

      {lista.map(item => {
        const pct = maior ? Math.round((item.valor / maior) * 100) : 0;
        const className = getClass(item.categoria);

        return (
          <div key={item.categoria} className={`category-row ${className}`}>
            <span className="category-name">{item.categoria}</span>

            <div className="category-bar">
              <div className="category-fill" style={{ width: `${pct}%` }} />
            </div>

            <span className="category-value">{money(item.valor)}</span>
          </div>
        );
      })}

    </div>
  );
}

function getClass(nome = "") {
  const n = nome.toLowerCase();

  if (n.includes("merc")) return "cat-mercado";
  if (n.includes("trans")) return "cat-transporte";
  if (n.includes("alug") || n.includes("casa") || n.includes("mor")) return "cat-moradia";
  if (n.includes("ass") || n.includes("net") || n.includes("stream")) return "cat-assinaturas";

  return "cat-outros";
}
