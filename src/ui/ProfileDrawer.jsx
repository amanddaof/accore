import { useState } from "react";
import Profile from "../pages/Profile";

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
                <span>👤</span>
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
