import { useState, useEffect, useMemo } from "react";
import { getUserProfile } from "./services/userProfile";

import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import Footer from "./ui/Footer";
import { Outlet } from "react-router-dom";

import CardsDrawer from "./ui/CardsDrawer";
import ExternoDrawer from "./ui/ExternoDrawer";
import ReservasDrawer from "./ui/ReservasDrawer";
import BillsDrawer from "./ui/BillsDrawer";
import IncomeDrawer from "./ui/IncomeDrawer";

import ProfileDrawer from "./ui/ProfileDrawer";
import ProfileComparisonCard from "./ui/ProfileComparisonCard";
import { buildMonthlyAlerts } from "./calculations/notifications/buildMonthlyAlerts";

export default function Layout({
mes,
setMes,
reload,
cards,
mensal,
salarios,
transactions,
reservations,
bills,
loans
}) {
const [openCards, setOpenCards] = useState(false);
const [openExterno, setOpenExterno] = useState(false);
const [openReservas, setOpenReservas] = useState(false);
const [openBills, setOpenBills] = useState(false);
const [openIncomes, setOpenIncomes] = useState(false);
const [openProfile, setOpenProfile] = useState(false);

const [profile, setProfile] = useState(null);

useEffect(() => {
getUserProfile()
.then(setProfile)
.catch(console.error);
}, []);

/* ================= SOBRA INDIVIDUAL ================= */
const sobraIndividualMes = useMemo(() => {
if (!profile || !salarios) return 0;
return profile.display_name === "Amanda"
? salarios.amanda?.sobra ?? 0
: salarios.celso?.sobra ?? 0;
}, [profile, salarios]);

/* ================= AVISOS ================= */
const avisosLista = useMemo(() => {
if (!profile) return [];
return buildMonthlyAlerts({
perfil: profile,
saldoMes: sobraIndividualMes
});
}, [profile, sobraIndividualMes]);

/* ================= COMPARATIVO ================= */
const comparativoCard = useMemo(() => {
if (!profile || !mensal || Object.keys(mensal).length === 0)
return null;

return (
<ProfileComparisonCard
mes={mes}
mensal={mensal}
salarios={salarios}
profile={profile}
/>
);
}, [profile, mes, mensal, salarios]);

function handleGlobalSelect(item) {
setOpenCards(false);
setOpenExterno(false);
setOpenReservas(false);
setOpenBills(false);
setOpenIncomes(false);

if (item.type === "transaction") setOpenCards(true);
if (item.type === "externo") setOpenExterno(true);
if (item.type === "reservation") setOpenReservas(true);
if (item.type === "bill") setOpenBills(true);
if (item.type === "income") setOpenIncomes(true);
}

function handleProfileUpdate(novoPerfil) {
setProfile(novoPerfil);
}

return (
<div style={{ display: "flex", minHeight: "100vh" }}>
<Sidebar />

<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
<Header
mes={mes}
onMesChange={setMes}
onReload={reload}
avisos={avisosLista}
mensal={mensal}
salarios={salarios}
transactions={transactions}
reservations={reservations}
bills={bills}
loans={loans}
onGlobalSelect={handleGlobalSelect}
onOpenCards={() => setOpenCards(true)}
isCardsOpen={openCards}
onOpenExterno={() => setOpenExterno(true)}
isExternoOpen={openExterno}
onOpenReservas={() => setOpenReservas(true)}
isReservasOpen={openReservas}
onOpenBills={() => setOpenBills(true)}
isBillsOpen={openBills}
onOpenIncomes={() => setOpenIncomes(true)}
isIncomesOpen={openIncomes}
onOpenProfile={() => setOpenProfile(true)}
avatarUrl={profile?.avatar_url || null}
/>

<main style={{ flex: 1 }}>
<Outlet context={{ usuarioLogado: profile?.display_name || null }} />
</main>

<Footer />

{/* DRAWERS */}
<CardsDrawer open={openCards} onClose={() => setOpenCards(false)} cards={cards} mes={mes} />
<ExternoDrawer open={openExterno} onClose={() => setOpenExterno(false)} mes={mes} />
<ReservasDrawer open={openReservas} onClose={() => setOpenReservas(false)} />
<BillsDrawer open={openBills} onClose={() => setOpenBills(false)} mes={mes} />
<IncomeDrawer open={openIncomes} onClose={() => setOpenIncomes(false)} />

<ProfileDrawer
open={openProfile}
onClose={() => setOpenProfile(false)}
userName={profile?.display_name || "Usuário"}
avatarUrl={profile?.avatar_url || null}
avisos={avisosLista}
comparativoCard={comparativoCard}
onProfileUpdate={handleProfileUpdate}
/>
</div>
</div>
);
}




import { money } from "../utils/money";

/**
* Obtém os dados por pessoa independente da forma:
* 1) objeto: { amanda: { atual, anterior } }
* 2) array: [ { nome: "Amanda", atual, anterior } ]
*/
function getPessoaData(porPessoa, usuario) {
if (!porPessoa) return null;

// forma objeto
if (!Array.isArray(porPessoa) && porPessoa[usuario]) {
return porPessoa[usuario];
}

// forma array
if (Array.isArray(porPessoa)) {
const item = porPessoa.find(
p => p.nome?.toLowerCase() === usuario
);
if (item) return {
atual: { total: item.total ?? item.atual?.total ?? 0 },
anterior: { total: item.anterior?.total ?? 0 }
};
}

return null;
}


export default function ProfileComparisonCard({ mensal, profile }) {
if (!mensal) {
return <div>❌ Sem dados mensais carregados</div>;
}

const usuario = profile?.display_name?.toLowerCase();
const pessoaData = getPessoaData(mensal?.porPessoa, usuario);

if (!pessoaData) {
return <div>⚠️ Sem dados suficientes para comparar ({usuario})</div>;
}

const atual = Number(pessoaData.atual?.total ?? 0);
const anterior = Number(pessoaData.anterior?.total ?? 0);

const variacao = atual - anterior;
const variacaoPercent = anterior
? ((variacao / anterior) * 100).toFixed(1)
: 0;

return (
<div className="profile-comparativo-card">
<strong>{profile.display_name} — Comparativo mensal</strong>

<div style={{ marginTop: "8px" }}>
🟢 Atual: <strong>{money(atual)}</strong>
</div>
<div>
🔵 Anterior: <strong>{money(anterior)}</strong>
</div>

<div style={{ marginTop: "8px" }}>
{variacao === 0
? "— sem variação"
: `${variacaoPercent}% (${variacao > 0 ? "gastou mais" : "gastou menos"})`}
</div>
</div>
);
}



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
