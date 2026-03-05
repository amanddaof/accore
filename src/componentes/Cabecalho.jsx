import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../contextos/AuthContext";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { supabase } from "../servicos/supabase";
import SeletorMes from "./SeletorMes";
import { useMes } from "../contextos/MesContexto";
import { buscarResumoMes } from "../paginas/Dashboard/logica/buscarResumoMes";
import "./estilos/Cabecalho.css";

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [sobraUsuario, setSobraUsuario] = useState(null);

  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { mesSelecionado } = useMes();

  async function handleLogout() {
    await logout();
    fecharMenu();
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

  /* ================= BUSCAR AVATAR E NOME ================= */

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profile")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        return;
      }

      setAvatarUrl(data?.avatar_url || null);
      setDisplayName(data?.display_name || null);
    }

    carregarPerfil();
  }, []);

  /* ================= CALCULAR SOBRA DO USUÁRIO ================= */

  useEffect(() => {
    async function carregarResumo() {
      if (!displayName) return;

      try {
        const dados = await buscarResumoMes(mesSelecionado);

        const sobra =
          displayName === "Amanda"
            ? dados.sobraAmanda
            : dados.sobraCelso;

        setSobraUsuario(sobra);
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
      }
    }

    carregarResumo();
  }, [displayName, mesSelecionado]);

  /* ================= FECHAR MENU CLICANDO FORA ================= */

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

  const isDashboard = location.pathname.startsWith("/dashboard");

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

          {/* INDICADOR DE SOBRA (não aparece na dashboard) */}
          {!isDashboard && sobraUsuario !== null && (
            <div
              className={`saldo-header ${
                sobraUsuario >= 0 ? "positivo" : "negativo"
              }`}
            >
              <>
  R$ {sobraUsuario.toFixed(2)}
  <img
    src={sobraUsuario >= 0 ? "/icone/positivo.png" : "/icone/negativo.png"}
    alt="status"
    className="icone-status"
  />
</>
            </div>
          )}

          {/* ATUALIZAR */}
          <button
            className="icone"
            onClick={() => window.location.reload()}
          >
            <img src="/icone/atualizar.png" alt="Atualizar" />
          </button>

          {/* AVATAR DO USUÁRIO */}
          <NavLink to="/perfil" className="perfil-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Perfil" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </NavLink>

          {/* SAIR */}
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
