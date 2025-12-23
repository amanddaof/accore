import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/userProfile";
import { uploadAvatar } from "../services/avatar";
import "./Profile.css";

export default function Profile({ onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
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
  }, []);

  /* ================= AVATAR ================= */
  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file || !profile) return;

    try {
      setAvatarUploading(true);

      const url = await uploadAvatar(file, profile.user_id);

      const novoPerfil = {
        ...profile,
        avatar_url: url
      };

      // estado local (Profile)
      setProfile(novoPerfil);

      // 🔥 avisa o Layout para atualizar Header + Drawer
      if (onProfileUpdate) {
        onProfileUpdate(novoPerfil);
      }
    } catch (err) {
      console.error("Erro ao enviar avatar:", err);
      alert("Erro ao enviar foto");
    } finally {
      setAvatarUploading(false);
    }
  }

  /* ================= SAVE ================= */
  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile(profile);

      // garante sincronização total após salvar
      if (onProfileUpdate) {
        onProfileUpdate(profile);
      }

      alert("Preferências salvas");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  }

  /* ================= STATES ================= */
  if (loading) {
    return <div className="page">Carregando perfil…</div>;
  }

  if (!profile) {
    return <div className="page">Perfil não encontrado</div>;
  }

  return (
    <div className="page profile-page">
      <h1>Perfil do usuário</h1>
      <p className="subtitle">Configure as notificações que deseja acompanhar</p>

      {/* ================= IDENTIDADE ================= */}
      <section className="profile-section">
        <h2>Identidade</h2>

        <label>
          Nome exibido
          <input
            type="text"
            placeholder="Ex: Amanda"
            value={profile.display_name || ""}
            onChange={e =>
              setProfile({
                ...profile,
                display_name: e.target.value
              })
            }
          />
        </label>
      </section>

      {/* ================= AVATAR ================= */}
      <section className="profile-section">
        <h2>Foto do perfil</h2>

        <div className="profile-avatar-editor">
          <div className="avatar-preview">
            {profile.avatar_url ? (
              <img
                src={`${profile.avatar_url}?t=${Date.now()}`}
                alt="Avatar"
              />
            ) : (
              <span>👤</span>
            )}
          </div>

          <label className="avatar-upload">
            {avatarUploading ? "Enviando…" : "Alterar foto"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </label>
        </div>
      </section>

      {/* ================= NOTIFICAÇÕES ================= */}
      <section className="profile-section">
        <h2>Notificações</h2>

        <label>
          <input
            type="checkbox"
            checked={profile.notify_deficit}
            onChange={e =>
              setProfile({ ...profile, notify_deficit: e.target.checked })
            }
          />
          Avisar quando entrar em déficit no mês
        </label>

        <label>
          <input
            type="checkbox"
            checked={profile.notify_low_sobra}
            onChange={e =>
              setProfile({ ...profile, notify_low_sobra: e.target.checked })
            }
          />
          Avisar quando a sobra ficar muito baixa
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
          Avisar quando os gastos fugirem do padrão
        </label>

        <label>
          <input
            type="checkbox"
            checked={profile.notify_spending_pace}
            onChange={e =>
              setProfile({
                ...profile,
                notify_spending_pace: e.target.checked
              })
            }
          />
          Avisar quando o ritmo de gastos acelerar
        </label>
      </section>

      {/* ================= INSIGHTS ================= */}
      <section className="profile-section">
        <h2>Insights & relatórios</h2>

        <label>
          <input
            type="checkbox"
            checked={profile.insight_monthly_summary}
            onChange={e =>
              setProfile({
                ...profile,
                insight_monthly_summary: e.target.checked
              })
            }
          />
          Mostrar resumo automático do mês
        </label>

        <label>
          <input
            type="checkbox"
            checked={profile.insight_month_comparison}
            onChange={e =>
              setProfile({
                ...profile,
                insight_month_comparison: e.target.checked
              })
            }
          />
          Mostrar comparativo com o mês anterior
        </label>

        <label>
          <input
            type="checkbox"
            checked={profile.insight_year_highlights}
            onChange={e =>
              setProfile({
                ...profile,
                insight_year_highlights: e.target.checked
              })
            }
          />
          Mostrar destaques do ano
        </label>
      </section>

      {/* ================= LIMITES ================= */}
      <section className="profile-section">
        <h2>Limites</h2>

        <label>
          Limite mínimo de sobra aceitável
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
          Avisar quando os gastos passarem de (% da média)
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
      </section>

      {/* ================= SALVAR ================= */}
      <button className="primary" onClick={handleSave} disabled={saving}>
        {saving ? "Salvando…" : "Salvar preferências"}
      </button>
    </div>
  );
}
