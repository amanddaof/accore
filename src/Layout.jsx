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
      .catch(err => {
        console.error("Erro ao carregar perfil:", err);
      });
  }, []);

  const avisos = profile
    ? buildMonthlyAlerts({
        perfil: profile,
        saldoMes: mensal?.total?.sobra ?? 0,
        projecaoSaldoMes: mensal?.projecao?.sobra ?? null,
        gastoAtual: mensal?.total?.gasto ?? 0,
        gastoMedio: mensal?.mediaGastos ?? 0
      })
    : [];

  // 🔥 BUSCA GLOBAL → DECIDE QUAL DRAWER ABRIR
  function handleGlobalSelect(item) {
    // fecha todos antes
    setOpenCards(false);
    setOpenExterno(false);
    setOpenReservas(false);
    setOpenBills(false);
    setOpenIncomes(false);
  
    if (item.type === "transaction") {
      setOpenCards(true);      // ✅ TRANSAÇÕES → CARDS
    }
  
    if (item.type === "externo") {
      setOpenExterno(true);    // ✅ EXTERNO → EXTERNO
    }
  
    if (item.type === "reservation") {
      setOpenReservas(true);   // ✅ RESERVAS
    }
  
    if (item.type === "bill") {
      setOpenBills(true);      // ✅ CONTAS DA CASA
    }
  
    if (item.type === "income") {
      setOpenIncomes(true);    // ✅ RECEBIMENTOS
    }
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

          onGlobalSelect={handleGlobalSelect} // 🔥 AQUI

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








