import { useState } from "react";
import Header from "./ui/Header";
import Sidebar from "./ui/Sidebar";
import Footer from "./ui/Footer";
import { Outlet } from "react-router-dom";
import CardsDrawer from "./ui/CardsDrawer";
import ExternoDrawer from "./ui/ExternoDrawer";
import ReservasDrawer from "./ui/ReservasDrawer";
import BillsDrawer from "./ui/BillsDrawer";
import IncomeDrawer from "./ui/IncomeDrawer"; // ✅ novo

export default function Layout({ mes, setMes, reload, cards, mensal, salarios, transactions }) {

  const [openCards, setOpenCards] = useState(false);
  const [openExterno, setOpenExterno] = useState(false);
  const [openReservas, setOpenReservas] = useState(false);
  const [openBills, setOpenBills] = useState(false);
  const [openIncomes, setOpenIncomes] = useState(false); // ✅ novo

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

          onOpenCards={() => setOpenCards(true)}
          isCardsOpen={openCards}

          onOpenExterno={() => setOpenExterno(true)}
          isExternoOpen={openExterno}

          onOpenReservas={() => setOpenReservas(true)}
          isReservasOpen={openReservas}

          onOpenBills={() => setOpenBills(true)}
          isBillsOpen={openBills}

          // ✅ RECEBIMENTOS
          onOpenIncomes={() => setOpenIncomes(true)}
          isIncomesOpen={openIncomes}
        />

        {/* CONTEÚDO DAS PÁGINAS */}
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

        {/* ✅ DRAWER DE RECEBIMENTOS */}
        <IncomeDrawer
          open={openIncomes}
          onClose={() => setOpenIncomes(false)}
        />

      </div>
    </div>
  );
}
