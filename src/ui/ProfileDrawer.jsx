import { useState } from "react";
import Profile from "../pages/Profile";
import "./ProfileDrawer.css";

import MonthComparisonCard from "./MonthComparisonCard"; // ⬅️ necessário

export default function ProfileDrawer({
  open,
  onClose,
  userName = "Usuário",
  avatarUrl = null,

  /* 🔥 agora recebemos valores separados diretamente */
  avisos = [],
  comparativoMensal = null,
  porPessoa = null,

  onProfileUpdate
}) {
  const [modo, setModo] = useState("avisos"); // "avisos" | "preferencias"

  // 🔒 garante que sempre abre em "avisos"
  if (!open) {
    if (modo !== "avisos") setModo("avisos");
    return null;
  }

  function handleClose() {
    setModo("avisos");
    onClose();
  }

  /* ==========================================================
     🔍 RESOLVENDO DADOS POR PESSOA LOGADA
     Amanda → chave "amanda"
     Celso  → chave "celso"
  =========================================================== */
  const chavePessoa = userName.toLowerCase(); // "amanda" / "celso"
  const dadosPessoa = porPessoa?.[chavePessoa] || null;

  /* ==========================================================
     🎯 formato que o MonthComparisonCard espera
     só monta se tiver dados da pessoa logada
  =========================================================== */
  let comparativoRender = null;

  if (comparativoMensal && dadosPessoa) {
    comparativoRender = {
      mesAnterior: comparativoMensal.mesAnterior,
      mesAtual: comparativoMensal.mesAtual,
      variacao: {
        valor:
          Number(dadosPessoa?.atual?.total || 0) -
          Number(dadosPessoa?.anterior?.total || 0)
      },
      porPessoa: {
        [chavePessoa]: {
          anterior: { total: Number(dadosPessoa?.anterior?.total || 0) },
          atual: { total: Number(dadosPessoa?.atual?.total || 0) }
        }
      }
    };
  }

  return (
    <div className="profile-drawer-overlay" onClick={handleClose}>
      <aside
        className="profile-drawer"
        onClick={e => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <header className="profile-drawer-header center">
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>

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

          {/* ⭐ NOVO: comparativo mensal do usuário logado */}
          {modo === "avisos" && comparativoRender && (
            <div style={{ marginBottom: "20px" }}>
              <MonthComparisonCard {...comparativoRender} />
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
