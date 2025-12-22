import { useState, useEffect } from "react";
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
import { buildMonthlyAlerts } from "./calculations/notifications/buildMonthlyAlerts";

export default function Layout({
  mes,
  setMes,
  reload,
  cards,
  mensal,
  salarios,

  // 🔥 DADOS BRUTOS DO DASHBOARD
  transactions,
  reservations,
  bills,
  loans
}) {
  /* ================= DEBUG ================= */
  console.log("🔥 Layout renderizou");

  const [openCards, setOpenCards] = useState(false);
  const [openExterno, setOpenExterno] = useState(false);
  const [openReservas, setOpenReservas] = useState(false);
  const [openBills, setOpenBills] = useState(false);
  const [openIncomes, setOpenIncomes] = useState(false);

  const [openProfile, setOpenProfile] = useState(false);
  const [profile, setProfile] = useState(null);

  /* ================= PERFIL ================= */
  useEffect(() => {
    console.log("🔄 Buscando perfil do usuário...");
    getUserProfile()
      .then(data => {
        console.log("✅ Perfil carregado:", data);
        setProfile(data);
      })
      .catch(err => {
        console.error("❌ Erro ao carregar perfil:", err);
      });
  }, []);

  /* ================= AVISOS ================= */
  console.log("🔥 Antes de buildMonthlyAlerts", {
    profile,
    mensal
  });

  const avisos = profile
    ? buildMonthlyAlerts({
        perfil: profile,
        saldoMes: mensal?.total?.sobra ?? 0,
        projecaoSaldoMes: mensal?.projecao?.sobra ?? null,
        gastoAtual: mensal?.total?.gasto ?? 0,
        gastoMedio: mensal?.mediaGastos ?? 0
      })
    : [];

  console.log("📌 Avisos finais no Layout:", avisos);

  /* ================= BUSCA GLOBAL ================= */
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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR FIXA */}
      <Sidebar />

      {/* ÁREA PRINCIPAL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header
          mes={mes}
          onMesChange={setMes}
          onReload={reload}
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
        />

        {/* CONTEÚDO */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>

        <Footer />

        {/* DRAWERS */}
        <CardsDrawer
          open={openCards}
          onClose={() => setOpenCards(false)}
          cards={cards}
          mes={mes}
        />

        <ExternoDrawer
          open={openExterno}
          onClose={() => setOpenExterno(false)}
          mes={mes}
        />

        <ReservasDrawer
          open={openReservas}
          onClose={() => setOpenReservas(false)}
        />

        <BillsDrawer
          open={openBills}
          onClose={() => setOpenBills(false)}
          mes={mes}
        />

        <IncomeDrawer
          open={openIncomes}
          onClose={() => setOpenIncomes(false)}
        />

        <ProfileDrawer
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          userName={profile?.display_name || "Usuário"}
          avatarUrl={profile?.avatar_url || null}
          avisos={avisos}
        />
      </div>
    </div>
  );
}
