import Profile from "../pages/Profile";

export default function ProfileDrawer({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer right" onClick={e => e.stopPropagation()}>
        <header className="drawer-header">
          <h2>Perfil do usuário</h2>
          <button onClick={onClose}>✕</button>
        </header>

        <div className="drawer-content">
          <Profile />
        </div>
      </div>
    </div>
  );
}
