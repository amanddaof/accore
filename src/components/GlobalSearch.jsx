import { useState } from "react";
import "./GlobalSearch.css";

export default function GlobalSearch() {
  const [value, setValue] = useState("");

  return (
    <div className="global-search">
      <span className="search-icon">🔍</span>

      <input
        type="text"
        placeholder="Buscar por tudo..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
