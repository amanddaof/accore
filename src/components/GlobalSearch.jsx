import { useState, useRef, useEffect } from "react";
import "./GlobalSearch.css";

export default function GlobalSearch({
  transactions = [],
  reservations = [],
  bills = [],
  loans = [],
  onSelect
}) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);

    if (v.length < 2) {
      setOpen(false);
      return;
    }

    const res = [];

    transactions.forEach(t => {
      if ((t.descricao || "").toLowerCase().includes(v.toLowerCase())) {
        res.push({
          type: "transaction",
          id: t.id,
          title: t.descricao,
          subtitle: "Transação"
        });
      }
    });

    reservations.forEach(r => {
      if ((r.descricao || "").toLowerCase().includes(v.toLowerCase())) {
        res.push({
          type: "reservation",
          id: r.id,
          title: r.descricao,
          subtitle: "Reserva"
        });
      }
    });

    bills.forEach(b => {
      if ((b.descricao || b.nome || "").toLowerCase().includes(v.toLowerCase())) {
        res.push({
          type: "bill",
          id: b.id,
          title: b.descricao || b.nome,
          subtitle: "Conta da casa"
        });
      }
    });

    loans.forEach(l => {
      if ((l.descricao || l.nome || "").toLowerCase().includes(v.toLowerCase())) {
        res.push({
          type: "loan",
          id: l.id,
          title: l.descricao || l.nome,
          subtitle: "Empréstimo"
        });
      }
    });

    setResults(res);
    setOpen(true);
  }

  function handleSelect(item) {
    setOpen(false);
    setValue("");
    onSelect(item); // 🔥 não navega, delega
  }

  return (
    <div className="global-search-wrapper" ref={ref}>
      <div className="global-search">
        <span className="search-icon">🔍</span>
        <input
          value={value}
          onChange={handleChange}
          placeholder="Buscar por tudo..."
        />
      </div>

      {open && (
        <div className="search-dropdown">
          {results.length === 0 && (
            <div className="search-empty">Nenhum resultado</div>
          )}

          {results.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="search-item"
              onClick={() => handleSelect(item)}
            >
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
