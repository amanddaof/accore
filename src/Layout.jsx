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

  /* ================= PERFIL ================= */
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(console.error);
  }, []);

  /* ================= SOBRA INDIVIDUAL ================= */
  const sobraIndividualMes = useMemo(() => {
    if (!profile || !salarios) return 0;

    if (profile.display_name === "Amanda") {
      return salarios.amanda?.sobra ?? 0;
    }

    if (profile.display_name === "Celso") {
      return salarios.celso?.sobra ?? 0;
    }

    return 0;
  }, [profile, salarios]);


  /* ================= AVISOS (INCLUINDO COMPARATIVO) ================= */
  const avisos = useMemo(() => {
    if (!profile) return [];

    const listaBase = buildMonthlyAlerts({
      perfil: profile,
      saldoMes: sobraIndividualMes,
    });

    // 👇 garante que tenha dados antes de mostrar o comparativo pessoal
    if (mensal?.comparativoMensal && mensal?.porPessoa) {
      listaBase.push({
        tipo: "comparativo",
        icon: "👥",
        texto: "Comparativo mensal",
        component: (
          <ProfileComparisonCard
            comparativoMensal={mensal.comparativoMensal}
            porPessoa={mensal.porPessoa}
            profile={profile}
          />
        ),
      });
    }

    return listaBase;
  }, [profile, sobraIndividualMes, mensal]);


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
          avisos={avisos}
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
          avisos={avisos}
          onProfileUpdate={handleProfileUpdate}
        />

      </div>
    </div>
  );
}
