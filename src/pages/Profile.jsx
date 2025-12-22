import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/userProfile";
import "./ProfileDrawer.css";

export default function ProfileDrawer({
  open,
  onClose,
  userName,
  avatarUrl,
  avisos
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [open]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile(profile);
      alert("Preferências salvas");
      setShowPreferences(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="profile-drawer-overlay" onClick={onClose} />

      <aside className="profile-drawer">
        {/* ================= HEADER ================= */}
        <header className="profile-drawer-header">
          <div className="profile-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : "👤"}
          </div>

          <div className="profile-user-info">
            <strong>{userName}</strong>
            <span>Perfil do usuário</span>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="profile-drawer-content">
          {loading && (
            <div className="profile-empty">Carregando perfil…</div>
          )}

          {!loading && !showPreferences && (
            <>
              <div className="profile-section-title">
                Avisos do mês
              </div>

              {avisos.length === 0 && (
                <div className="profile-empty">
                  Nenhum aviso no momento 🎉
                </div>
              )}

              {avisos.map((a, i) => (
                <div key={i} className={`profile-alert ${a.tipo}`}>
                  <span className="icon">{a.icon}</span>
                  <span>{a.texto}</span>
                </div>
              ))}
            </>
          )}

          {!loading && showPreferences && profile && (
            <>
              {/* ================= NOTIFICAÇÕES ================= */}
              <div className="profile-section-title">
                Notificações
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={profile.notify_deficit}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      notify_deficit: e.target.checked
                    })
                  }
                />
                Avisar quando entrar em déficit
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={profile.notify_projection_negative}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      notify_projection_negative: e.target.checked
                    })
                  }
                />
                Avisar quando a projeção virar negativa
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={profile.notify_low_sobra}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      notify_low_sobra: e.target.checked
                    })
                  }
                />
                Avisar quando a sobra ficar baixa
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={profile.notify_abnormal_spending}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      notify_abnormal_spending: e.target.checked
                    })
                  }
                />
                Avisar quando gastos fugirem do padrão
              </label>

              {/* ================= LIMITES ================= */}
              <div className="profile-section-title">
                Limites
              </div>

              <label>
                Sobra mínima aceitável
                <input
                  type="number"
                  value={profile.min_sobra_alert}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      min_sobra_alert: Number(e.target.value)
                    })
                  }
                />
              </label>

              <label>
                Alerta de gasto (% da média)
                <input
                  type="number"
                  value={profile.gasto_alert_percent}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      gasto_alert_percent: Number(e.target.value)
                    })
                  }
                />
              </label>
            </>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="profile-drawer-footer">
          {!showPreferences ? (
            <button
              className="primary"
              onClick={() => setShowPreferences(true)}
            >
              ⚙️ Preferências
            </button>
          ) : (
            <button
              className="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar preferências"}
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}
