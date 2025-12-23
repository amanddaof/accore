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
  /* ================= DRAWERS ================= */
  const [openCards, setOpenCards] = useState(false);
  const [openExterno, setOpenExterno] = useState(false);
  const [openReservas, setOpenReservas] = useState(false);
  const [openBills, setOpenBills] = useState(false);
  const [openIncomes, setOpenIncomes] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  /* ================= PERFIL ================= */
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(console.error);
  }, []);

  /* ================= DADOS DO MÊS (FILTRO ATUAL) ================= */
  const sobraRealMes = mensal?.total?.sobra ?? 0;

  // 🔎 LOG GLOBAL DO VALOR REAL
  console.log("[DEBUG] MÊS ATUAL:", mes);
  console.log("[DEBUG] sobraRealMes:", sobraRealMes);
  console.log("[DEBUG] mensal.total:", mensal?.total);

  /* ================= AVISOS ================= */
  const avisos = useMemo(() => {
    console.log("[DEBUG] useMemo avisos disparado");
    console.log("[DEBUG] profile:", profile);
    console.log("[DEBUG] saldo enviado para buildMonthlyAlerts:", sobraRealMes);

    if (!profile || !mensal) {
      console.log("[DEBUG] retornando avisos vazios (profile ou mensal ausente)");
      return [];
    }

    const resultado = buildMonthlyAlerts({
      saldoMes: sobraRealMes
    });

    console.log("[DEBUG] avisos retornados:", resultado);

    return resultado;
  }, [profile, mensal, sobraRealMes]);

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

  /* ================= UPDATE PERFIL ================= */
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
          <Outlet />
        </main>

        <Footer />

        {/* ================= DRAWERS ================= */}
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
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  );
}
