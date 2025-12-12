import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { SidebarIcon } from "./SidebarIcons";
import { useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>

      <div className="sidebar-top">

        <button
          className="sidebar-toggle"
          onClick={() => setOpen(!open)}
          title="Expandir menu"
        >
          {open ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </div>

      <nav className="sidebar-menu">

        <NavLink to="/settings/salaries" className="sidebar-item">
		  <SidebarIcon name="salary" />
		  <span className="sidebar-label">Salários</span>
		</NavLink>

		<NavLink to="/settings/cards" className="sidebar-item">
		  <SidebarIcon name="cards" />
		  <span className="sidebar-label">Cartões</span>
		</NavLink>

		<NavLink to="/settings/loans" className="sidebar-item">
		  <SidebarIcon name="loans" />
		  <span className="sidebar-label">Empréstimos</span>
		</NavLink>

		<NavLink to="/settings/categories" className="sidebar-item">
		  <SidebarIcon name="categories" />
		  <span className="sidebar-label">Categorias</span>
		</NavLink>

      </nav>
    </aside>
  );
}
