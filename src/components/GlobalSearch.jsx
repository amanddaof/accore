import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../search/globalSearch";
import "./GlobalSearch.css";

export default function GlobalSearch({
  transactions = [],
  reservations = [],
  bills = [],
  loans = []
}) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const ref = useRef(null);
  const navigate = useNavigate();

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

    if (v.length > 1) {
      const res = globalSearch({
        query: v,
        transactions,
        reservations,
        bills,
        loans
      });
      setResults(res);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  function handleSelect(item) {
    setOpen(false);
    setValue("");
    navigate(item.route);
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
            <div className="search-empty">
              Nenhum resultado encontrado
            </div>
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
