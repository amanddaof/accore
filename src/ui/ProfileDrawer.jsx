import { useState } from "react";
import Profile from "../pages/Profile";
import "./ProfileDrawer.css";

/**
 * Drawer do Perfil do Usuário
 * - Abre mostrando avisos
 * - Botão leva para Preferências
 * - Ao fechar, sempre volta para avisos
 */
export default function ProfileDrawer({
  open,
  onClose,
  userName = "Usuário",
  avatarUrl = null,
  avisos = []
}) {
  const [modo, setModo] = useState("avisos"); // "avisos" | "preferencias"

  if (!open) return null;

  function handleClose() {
    setModo("avisos");
    onClose();
  }

  return (
    <div className="profile-drawer-overlay" onClick={handleClose}>
      <aside
        className="profile-drawer"
        onClick={e => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <header className="profile-drawer-header">
          <div className="profile-header">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : (
                <span className="avatar-placeholder">👤</span>
              )}
            </div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <small>Configura como o sistema te acompanha</small>
            </div>
          </div>

          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </header>

        {/* ================= AÇÃO ================= */}
        <div className="profile-drawer-action">
          {modo === "avisos" ? (
            <button
              className="profile-link-button"
              onClick={() => setModo("preferencias")}
            >
              ⚙️ Preferências
            </button>
          ) : (
            <button
              className="profile-link-button"
              onClick={() => setModo("avisos")}
            >
              ← Voltar para avisos
            </button>
          )}
        </div>

        {/* ================= CONTEÚDO ================= */}
        <div className="profile-drawer-content">
          {modo === "avisos" ? (
            <AvisosList avisos={avisos} />
          ) : (
            <Profile />
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
