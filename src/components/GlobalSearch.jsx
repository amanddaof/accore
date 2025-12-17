import { useState } from "react";
import { Search } from "lucide-react";
import "./GlobalSearch.css";

export default function GlobalSearch() {
  const [value, setValue] = useState("");

  return (
    <div className="global-search">
      <Search size={18} className="search-icon" />

      <input
        type="text"
        placeholder="Buscar por tudo..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
