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

/* ======================================================
   🔁 MAPEAR POR PESSOA — transforma array em objeto
   Exemplo:
   [{ pessoa:"Amanda", anterior:2000, total:2100 }]
   vira:
   { amanda:{ anterior:{total}, atual:{total}, valor } }
====================================================== */
function mapearPorPessoa(lista = []) {
  if (!Array.isArray(lista)) return {};

  const mapa = {};

  lista.forEach(item => {
    if (!item?.pessoa) return;

    const chave = item.pessoa.toLowerCase(); // "amanda", "celso"

    const anterior = Number(item.anterior ?? 0);
    const atual = Number(item.total ?? 0);
    const valor = atual - anterior;

    mapa[chave] = {
      anterior: { total: anterior },
      atual: { total: atual },
      valor
    };
  });

  return mapa;
}


/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */
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

  /* ================= AVISOS + COMPARATIVO ================= */
  const avisos = useMemo(() => {
    if (!profile) return { lista: [], comparativoMensal: null, porPessoa: {} };

    const lista = buildMonthlyAlerts({
      perfil: profile,
      saldoMes: sobraIndividualMes
    });

    return {
      lista,
      comparativoMensal: mensal?.comparativoMensal || null,
      porPessoa: mapearPorPessoa(mensal?.porPessoa || [])
    };
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

  /* ================= UPDATE PERFIL ================= */
  function handleProfileUpdate(novoPerfil) {
    setProfile(novoPerfil);
  }


  /* ======================================================
     🌙 DEBUG OPCIONAL — descomente se quiser verificar
  ======================================================= */
  // console.log("🧭 mapearPorPessoa:", mapearPorPessoa(mensal?.porPessoa));
  // console.log("📌 avisos final:", avisos);


  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 🔥 PASSANDO O PACOTE COMPLETO */}
        <Header
          mes={mes}
          onMesChange={setMes}
          onReload={reload}
          avisos={avisos}     // << correto agora
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

        {/* 👇 usuário logado para as rotas */}
        <main style={{ flex: 1 }}>
          <Outlet context={{ usuarioLogado: profile?.display_name || null }} />
        </main>

        <Footer />

        <CardsDrawer open={openCards} onClose={() => setOpenCards(false)} cards={cards} mes={mes} />
        <ExternoDrawer open={openExterno} onClose={() => setOpenExterno(false)} mes={mes} />
        <ReservasDrawer open={openReservas} onClose={() => setOpenReservas(false)} />
        <BillsDrawer open={openBills} onClose={() => setOpenBills(false)} mes={mes} />
        <IncomeDrawer open={openIncomes} onClose={() => setOpenIncomes(false)} />

        {/* 🔥 RECEBENDO O PACOTE COMPLETO */}
        <ProfileDrawer
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          userName={profile?.display_name || "Usuário"}
          avatarUrl={profile?.avatar_url || null}
          avisos={avisos.lista}
          comparativoMensal={avisos.comparativoMensal}
          porPessoa={avisos.porPessoa}
          onProfileUpdate={handleProfileUpdate}
        />

      </div>
    </div>
  );
}
