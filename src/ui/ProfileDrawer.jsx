import { useState } from "react";
import Profile from "../pages/Profile";
import "./ProfileDrawer.css";

export default function ProfileDrawer({
  open,
  onClose,
  userName,
  avatarUrl,
  avisos = [],
  comparativoCard,
  onProfileUpdate
}) {
  const [modo, setModo] = useState("avisos"); // avisos | preferencias

  if (!open) {
    if (modo !== "avisos") setModo("avisos");
    return null;
  }

  function handleClose() {
    setModo("avisos");
    onClose();
  }

  return (
    <div className="profile-drawer-overlay" onClick={handleClose}>
      <aside className="profile-drawer" onClick={e => e.stopPropagation()}>

        {/* ================= HEADER ================= */}
        <header className="profile-drawer-header center">
          <button className="close-btn" onClick={handleClose}>✕</button>

          <div className="profile-avatar-large">
            {avatarUrl ? (
              <img src={`${avatarUrl}?t=${Date.now()}`} alt="Avatar" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </div>

          <strong className="profile-name">{userName}</strong>
          <small className="profile-subtitle">
            Configura como o sistema te acompanha
          </small>
        </header>

        {/* ================= AÇÃO ================= */}
        <div className="profile-drawer-action">
          {modo === "avisos" ? (
            <button className="profile-link-button" onClick={() => setModo("preferencias")}>
              ⚙️ Preferências
            </button>
          ) : (
            <button className="profile-link-button" onClick={() => setModo("avisos")}>
              ← Voltar para avisos
            </button>
          )}
        </div>

        {/* ================= CONTEÚDO ================= */}
        <div className="profile-drawer-content">

          {/* ⭐ COMPARATIVO — aparece ANTES dos avisos */}
          {modo === "avisos" && comparativoCard && (
            <div style={{ marginBottom: "24px" }}>
              {comparativoCard}
            </div>
          )}

          {/* 🔔 avisos normais */}
          {modo === "avisos" ? (
            <AvisosList avisos={avisos} />
          ) : (
            <Profile onProfileUpdate={onProfileUpdate} />
          )}
        </div>
      </aside>
    </div>
  );
}

/* ======================================================
   LISTA DE AVISOS
====================================================== */
function AvisosList({ avisos }) {
  if (!avisos || avisos.length === 0) {
    return (
      <div className="profile-empty">
        <p>Nenhum aviso no momento 🎉</p>
      </div>
    );
  }

  return (
    <ul className="profile-avisos-list">
      {avisos.map((a, idx) => (
        <li key={idx} className={`profile-aviso ${a.tipo || ""}`}>
          <span className="aviso-icon">{a.icon || "ℹ️"}</span>
          <span className="aviso-texto">{a.texto}</span>
        </li>
      ))}
    </ul>
  );
}
