import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import SaveSavingsDrawer from "../ui/SaveSavingsDrawer";
import { gerarAlertas } from "../services/alerts.service";
import { logout } from "../services/auth";
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
  const { pathname } = useLocation();

  const [openSavings, setOpenSavings] = useState(false);

  // quantidade de alertas (mantida)
  const dados = useMemo(
    () => gerarAlertas({ mensal, salarios }),
    [mensal, salarios]
  );

  const quantidade =
    [...dados.amanda, ...dados.celso, ...dados.geral]
      .filter(a => a.tipo === "critico" || a.tipo === "atencao").length;

  console.log("AVATAR NO HEADER:", avatarUrl);

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
          <button
            className={`nav-link ${isCardsOpen ? "active" : ""}`}
            onClick={onOpenCards}
          >
            CARTÕES
          </button>

          <button
            className={`nav-link ${isExternoOpen ? "active" : ""}`}
            onClick={onOpenExterno}
          >
            EXTERNO
          </button>

          <button
            className={`nav-link ${isReservasOpen ? "active" : ""}`}
            onClick={onOpenReservas}
          >
            RESERVAS
          </button>

          <button
            className={`nav-link ${isBillsOpen ? "active" : ""}`}
            onClick={onOpenBills}
          >
            CASA
          </button>

          <button
            className={`nav-link ${isIncomesOpen ? "active" : ""}`}
            onClick={onOpenIncomes}
          >
            ENTRADAS
          </button>

          <button
            className={`nav-link ${openSavings ? "active" : ""}`}
            onClick={() => setOpenSavings(true)}
          >
            ECONOMIA
          </button>
        </nav>

        {/* DIREITA */}
        <div className="header-right">

          {/* PERFIL + BADGE DE NOTIFICAÇÕES */}
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

          {/* MÊS ORIGINAL */}
          <input
            type="month"
            value={mes}
            onChange={e => onMesChange(e.target.value)}
          />

          {/* RELOAD */}
          <button
            className="circle-icon-btn"
            onClick={onReload}
            title="Atualizar dados"
          >
            ⟳
          </button>

          {/* LOGOUT */}
          <button
            className="circle-icon-btn"
            onClick={() => logout(navigate)}
            title="Sair"
          >
            ⏻
          </button>
        </div>
      </header>

      <SaveSavingsDrawer
        open={openSavings}
        onClose={() => setOpenSavings(false)}
      />
    </>
  );
}
