import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/userProfile";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile(profile);
      alert("Preferências salvas");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="page">Carregando perfil…</div>;
  }

  if (!profile) {
    return <div className="page">Perfil não encontrado</div>;
  }

  return (
    <div className="page profile-page">
      <h1>Perfil do usuário</h1>
      <p className="subtitle">
        Configure como o sistema te acompanha
      </p>

      {/* Seções entram aqui */}

      <button
        className="primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Salvando…" : "Salvar preferências"}
      </button>
    </div>
  );
}
