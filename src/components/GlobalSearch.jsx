import { useState, useRef, useEffect } from "react";
import "./GlobalSearch.css";

export default function GlobalSearch() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    setOpen(v.length > 1);
  }

  return (
    <div className="global-search-wrapper" ref={containerRef}>
      <div className="global-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por tudo..."
          value={value}
          onChange={handleChange}
        />
      </div>

      {open && (
        <div className="search-dropdown">
          <div className="search-empty">
            Comece digitando para buscar…
          </div>
        </div>
      )}
    </div>
  );
}
