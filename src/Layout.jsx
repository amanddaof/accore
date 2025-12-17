import { useState } from "react";
import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import Footer from "./ui/Footer";
import { Outlet } from "react-router-dom";
import CardsDrawer from "./ui/CardsDrawer";
import ExternoDrawer from "./ui/ExternoDrawer";
import ReservasDrawer from "./ui/ReservasDrawer";
import BillsDrawer from "./ui/BillsDrawer";
import IncomeDrawer from "./ui/IncomeDrawer";

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

          {/* 🔍 DADOS PARA BUSCA GLOBAL */}
          transactions={transactions}
          reservations={reservations}
          bills={bills}
          loans={loans}

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
      </div>
    </div>
  );
}
