import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SaveSavingsDrawer from "../ui/SaveSavingsDrawer";
import { logout } from "../services/auth";
import "./Header.css";

export default function Header({
  mes,
  onMesChange,
  onReload,

  onOpenProfile,
  avatarUrl,
  avisos, // <- notificações reais do usuário logado

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

          {/* PERFIL + CONTADOR DE AVISOS */}
          <button
            className="profile-button no-style profile-with-badge"
            onClick={onOpenProfile}
          >
            {avatarUrl ? (
              <img src={`${avatarUrl}?t=${Date.now()}`} alt="Perfil" />
            ) : (
              <span className="profile-placeholder">👤</span>
            )}

            {/* MOSTRA SOMENTE SE TIVER AVISOS */}
            {avisos?.length > 0 && (
              <span className="profile-badge">{avisos.length}</span>
            )}
          </button>

          {/* SELEÇÃO DE MÊS */}
          <input
            type="month"
            value={mes}
            onChange={e => onMesChange(e.target.value)}
          />

          {/* BOTÃO DE ATUALIZAR */}
          <button
            onClick={onReload}
            title="Atualizar dados"
            className="atualizar-btn-puro"
          >
            <img src="/btn-atualizar.png" alt="Atualizar" className="atualizar-img-pura" />
          </button>

          {/* LOGOUT */}
          <button
            className="atualizar-btn-puro"
            onClick={() => logout(navigate)}
            title="Sair"
          >
            <img
              src="/btn-sair.png"
              alt="Sair"
              className="atualizar-img-pura"
            />
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








