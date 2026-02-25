import { useContext } from "react";
import { AuthContext } from "../contextos/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import SeletorMes from "./SeletorMes";
import "./estilos/Cabecalho.css";

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
    fecharMenu(); // fecha dropdown se estiver aberto
    navigate("/login", { replace: true });
  }

  function isActive(paths) {
  return paths.some(path => location.pathname.startsWith(path));
}

  function toggleMenu(nome) {
    setMenuAberto(menuAberto === nome ? null : nome);
  }

  function fecharMenu() {
    setMenuAberto(null);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuAberto(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="cabecalho" ref={headerRef}>
      <div className="cabecalho-conteudo">

        {/* ESQUERDA */}
        <div className="cabecalho-esquerda">
          <button
            className="logo"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="/img/logo-accore-horizontal.png"
              alt="AC•CORE"
              className="logo-img"
            />
          </button>

          <nav className="menu">

            {/* COMPRAS */}
            <div className="menu-item">
              <button
  className={`menu-trigger ${isActive(["/cartoes", "/externo", "/reservas"]) ? "ativo" : ""}`}
  onClick={() => toggleMenu("compras")}
>
  Compras
</button>

              {menuAberto === "compras" && (
                <div className="dropdown">
                  <button onClick={() => { navigate("/cartoes"); fecharMenu(); }}>
                    CARTÕES
                  </button>
                  <button onClick={() => { navigate("/externo"); fecharMenu(); }}>
                    EXTERNO
                  </button>
                  <button onClick={() => { navigate("/reservas"); fecharMenu(); }}>
                    RESERVAS
                  </button>
                </div>
              )}
            </div>

            {/* CASA */}
            <button
  className={`menu-trigger ${isActive(["/casa"]) ? "ativo" : ""}`}
  onClick={() => navigate("/casa")}
>
  Casa
</button>

            {/* ECONOMIA */}
            <button
  className={`menu-trigger ${isActive(["/economia"]) ? "ativo" : ""}`}
  onClick={() => navigate("/economia")}
>
  Economia
</button>

            {/* REGISTRO */}
            <div className="menu-item">
              <button
  className={`menu-trigger ${isActive(["/entrada", "/emprestimos"]) ? "ativo" : ""}`}
  onClick={() => toggleMenu("registro")}
>
  Registro
</button>

              {menuAberto === "registro" && (
                <div className="dropdown">
                  <button onClick={() => { navigate("/entrada"); fecharMenu(); }}>
                    ENTRADA
                  </button>
                  <button onClick={() => { navigate("/emprestimos"); fecharMenu(); }}>
                    EMPRÉSTIMOS
                  </button>
                </div>
              )}
            </div>

          </nav>
        </div>

        {/* DIREITA */}
        <div className="cabecalho-direita">

          {/* CONFIGURAÇÕES */}
          <div className="menu-item">
            <button
              className="icone"
              onClick={() => toggleMenu("config")}
              title="Configurações"
            >
              <img src="/icone/config.png" alt="Configurações" />
            </button>

            {menuAberto === "config" && (
              <div className="dropdown dropdown-direita">
                <button onClick={() => { navigate("/salarios"); fecharMenu(); }}>
                  Salários
                </button>
                <button onClick={() => { navigate("/limites"); fecharMenu(); }}>
                  Cartões
                </button>
                <button onClick={() => { navigate("/categorias"); fecharMenu(); }}>
                  Categorias
                </button>
              </div>
            )}
          </div>

          <SeletorMes />

          <button
            className="icone"
            onClick={buscarDados}
          >
            <img src="/icone/atualizar.png" alt="Atualizar" />
          </button>

          <NavLink to="/perfil" className="perfil" />

          <button
            className="icone"
            onClick={handleLogout}
            title="Sair"
          >
            <img src="/icone/sair.png" alt="Sair" />
          </button>

        </div>
      </div>
    </header>
  );
}
