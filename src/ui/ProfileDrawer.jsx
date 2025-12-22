import { useState } from "react";
import Profile from "../pages/Profile";

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
    setModo("avisos"); // sempre volta para avisos ao fechar
    onClose();
  }

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div
        className="drawer right profile-drawer"
        onClick={e => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <header className="drawer-header">
          <div className="profile-header">
            <div className="avatar">
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
        <div className="drawer-action">
          {modo === "avisos" ? (
            <button
              className="link-button"
              onClick={() => setModo("preferencias")}
            >
              ⚙️ Preferências
            </button>
          ) : (
            <button
              className="link-button"
              onClick={() => setModo("avisos")}
            >
              ← Voltar para avisos
            </button>
          )}
        </div>

        {/* ================= CONTEÚDO ================= */}
        <div className="drawer-content">
          {modo === "avisos" ? (
            <AvisosList avisos={avisos} />
          ) : (
            <Profile />
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   LISTA DE AVISOS
====================================================== */
function AvisosList({ avisos }) {
  if (!avisos || avisos.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum aviso no momento 🎉</p>
      </div>
    );
  }

  return (
    <ul className="avisos-list">
      {avisos.map((a, idx) => (
        <li key={idx} className={`aviso ${a.tipo || ""}`}>
          <span className="aviso-icon">{a.icon || "ℹ️"}</span>
          <span className="aviso-texto">{a.texto}</span>
        </li>
      ))}
    </ul>
  );
}
