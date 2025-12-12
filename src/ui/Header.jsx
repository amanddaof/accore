import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import AlertsCenter from "../ui/AlertsCenter";
import SaveSavingsDrawer from "../ui/SaveSavingsDrawer";
import { gerarAlertas } from "../services/alerts.service";
import { logout } from "../services/auth"; // <-- IMPORTANTE
import "./Header.css";

export default function Header({
  mes,
  onMesChange,
  onReload,
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
  salarios
}) {

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showAlerts, setShowAlerts] = useState(false);
  const [openSavings, setOpenSavings] = useState(false);

  const dados = useMemo(() => gerarAlertas({ mensal, salarios }), [mensal, salarios]);

  const quantidade =
    [...dados.amanda, ...dados.celso, ...dados.geral]
      .filter(a => a.tipo === "critico" || a.tipo === "atencao").length;

  function ativo(path) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  return (
    <>
      <header className="header">

        {/* ESQUERDA */}
        <div className="header-left" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="logo">A</div>
          <span className="title">ACCORE</span>
        </div>

        {/* MENU */}
        <nav className="nav">

          <button className={`nav-link ${isCardsOpen ? "active" : ""}`} onClick={onOpenCards}>
            CARTÕES - teste
          </button>

          <button className={`nav-link ${isExternoOpen ? "active" : ""}`} onClick={onOpenExterno}>
            EXTERNO
          </button>

          <button className={`nav-link ${isReservasOpen ? "active" : ""}`} onClick={onOpenReservas}>
            RESERVAS
          </button>

          <button className={`nav-link ${isBillsOpen ? "active" : ""}`} onClick={onOpenBills}>
            CASA
          </button>

          <button className={`nav-link ${isIncomesOpen ? "active" : ""}`} onClick={onOpenIncomes}>
            ENTRADAS
          </button>

          <button className={`nav-link ${openSavings ? "active" : ""}`} onClick={() => setOpenSavings(true)}>
            ECONOMIA
          </button>

        </nav>

        {/* DIREITA */}
        <div className="header-right">

          {/* 🔔 ALERTAS */}
          <button
            className="alerts-btn"
            onClick={() => setShowAlerts(true)}
            title="Notificações"
          >
            🔔
            {quantidade > 0 && <span className="alerts-badge">{quantidade}</span>}
          </button>

          <input
            type="month"
            value={mes}
            onChange={e => onMesChange(e.target.value)}
          />

          <button className="reload-btn" onClick={onReload}>Atualizar</button>

          {/* 🔥 BOTÃO DE SAIR */}
          <button className="logout-btn" onClick={logout} title="Sair">
  ⏻
</button>


        </div>

      </header>

      {/* ALERTAS */}
      {showAlerts && (
        <AlertsCenter
          mensal={mensal}
          salarios={salarios}
          onClose={() => setShowAlerts(false)}
        />
      )}

      {/* DRAWER DE ECONOMIA */}
      <SaveSavingsDrawer
        open={openSavings}
        onClose={() => setOpenSavings(false)}
      />
    </>
  );
}

