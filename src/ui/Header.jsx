import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import SaveSavingsDrawer from "../ui/SaveSavingsDrawer";
import { gerarAlertas } from "../services/alerts.service";
import { logout } from "../services/auth";
import { supabase } from "../services/supabase";
import "./Header.css";

export default function Header({
  mes,
  onMesChange,
  onReload,

  onOpenProfile,
  avatarUrl,

  onOpenCards,
  isCardsOpen,
  onOpenExterno,
  isExternoOpen,
  onOpenReservas,
  isReservasOpen,
  onOpenBills,
  isBillsOpen,
  onOpenIncomes,
  isIncomesOpen,

  mensal,
  salarios,
}) {
  const navigate = useNavigate();

  const [openSavings, setOpenSavings] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState(null);

  // pega usuário logado
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUsuarioEmail(data?.user?.email ?? null);
    }
    loadUser();
  }, []);

  // gera alertas
  const dados = useMemo(
    () => gerarAlertas({ mensal, salarios }),
    [mensal, salarios]
  );

  // identifica o "perfil" correto baseado no usuário logado
  const perfil =
    usuarioEmail?.includes("amanda") ? "amanda" :
    usuarioEmail?.includes("celso")  ? "celso"  :
    "geral";

  // contador correto: SOMENTE do perfil logado e SOMENTE alertas importantes
  const quantidade =
    dados[perfil].filter(a => a.tipo === "critico" || a.tipo === "atencao").length;

  return (
    <>
      <header className="header">

        {/* ESQUERDA */}
        <div
          className="header-left"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo">
            <img src="/logo-ac.png" alt="AC Core" />
          </div>
          <span className="title">ACCORE</span>
        </div>

        {/* MENU */}
        <nav className="nav">
          <button className={`nav-link ${isCardsOpen ? "active" : ""}`} onClick={onOpenCards}>CARTÕES</button>
          <button className={`nav-link ${isExternoOpen ? "active" : ""}`} onClick={onOpenExterno}>EXTERNO</button>
          <button className={`nav-link ${isReservasOpen ? "active" : ""}`} onClick={onOpenReservas}>RESERVAS</button>
          <button className={`nav-link ${isBillsOpen ? "active" : ""}`} onClick={onOpenBills}>CASA</button>
          <button className={`nav-link ${isIncomesOpen ? "active" : ""}`} onClick={onOpenIncomes}>ENTRADAS</button>
          <button className={`nav-link ${openSavings ? "active" : ""}`} onClick={() => setOpenSavings(true)}>ECONOMIA</button>
        </nav>

        {/* DIREITA */}
        <div className="header-right">

          {/* PERFIL + NÚMERO DE NOTIFICAÇÕES DO PERFIL LOGADO */}
          <button
            className="profile-button no-style profile-with-badge"
            onClick={onOpenProfile}
          >
            {avatarUrl ? (
              <img src={`${avatarUrl}?t=${Date.now()}`} alt="Perfil" />
            ) : (
              <span className="profile-placeholder">👤</span>
            )}

            {quantidade > 0 && (
              <span className="profile-badge">{quantidade}</span>
            )}
          </button>

          {/* MÊS */}
          <input
            type="month"
            value={mes}
            onChange={e => onMesChange(e.target.value)}
          />

          {/* RELOAD */}
          <button className="circle-icon-btn" onClick={onReload} title="Atualizar dados">⟳</button>

          {/* LOGOUT */}
          <button className="circle-icon-btn" onClick={() => logout(navigate)} title="Sair">⏻</button>
        </div>
      </header>

      <SaveSavingsDrawer
        open={openSavings}
        onClose={() => setOpenSavings(false)}
      />
    </>
  );
}
