import { useState } from "react";
import Profile from "../pages/Profile";
import "./ProfileDrawer.css";

import MonthComparisonCard from "./MonthComparisonCard"; // ⬅️ ADICIONADO

export default function ProfileDrawer({
  open,
  onClose,
  userName = "Usuário",
  avatarUrl = null,
  avisos = {},
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

  // 🔎 pegamos os valores vindos do Layout
  const listaAvisos = avisos.lista || [];
  const comparativoMensal = avisos.comparativoMensal || null;
  const porPessoa = avisos.porPessoa || null;

  // 🧠 quem está logado
  const chavePessoa = userName.toLowerCase();

  // 🎯 dados da pessoa logada no comparativo
  const dadosPessoa = porPessoa?.[chavePessoa] || null;

  // 📌 estrutura para o card
  let comparativoRender = null;
  if (comparativoMensal && dadosPessoa) {
    comparativoRender = {
      mesAnterior: comparativoMensal.mesAnterior,
      mesAtual: comparativoMensal.mesAtual,
      variacao: { valor: Number(dadosPessoa.atual.total) - Number(dadosPessoa.anterior.total) },
      porPessoa: {
        [chavePessoa]: {
          anterior: { total: Number(dadosPessoa.anterior.total) },
          atual: { total: Number(dadosPessoa.atual.total) },
          valor: Number(dadosPessoa.atual.total) - Number(dadosPessoa.anterior.total)
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
              <MonthComparisonCard
                mesAnterior={comparativoRender.mesAnterior}
                mesAtual={comparativoRender.mesAtual}
                variacao={comparativoRender.variacao}
                porPessoa={comparativoRender.porPessoa}
              />
            </div>
          )}

          {/* 🔔 avisos normais */}
          {modo === "avisos" ? (
            <AvisosList avisos={listaAvisos} />
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
