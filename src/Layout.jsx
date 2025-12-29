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

  /* =======================================================
      🔥 COMPARATIVO INDIVIDUAL PARA O PERFIL
     ======================================================= */
  function prepararComparativoPerfil(mensal) {
    if (!mensal || !mensal.porPessoa || !mensal.comparativoMensal) return null;

    const [amanda, celso] = mensal.porPessoa;
    const cmp = mensal.comparativoMensal;

    return {
      mesAnterior: cmp.mesAnterior,
      mesAtual: cmp.mesAtual,
      variacao: cmp.variacao,
      porPessoa: {
        amanda: {
          anterior: { total: amanda?.gastoAnterior ?? 0 },
          atual: { total: amanda?.gasto ?? 0 },
        },
        celso: {
          anterior: { total: celso?.gastoAnterior ?? 0 },
          atual: { total: celso?.gasto ?? 0 },
        }
      }
    };
  }

  const comparativoMensalPerfil = useMemo(() => prepararComparativoPerfil(mensal), [mensal]);

  /* ================= AVISOS ================= */
  const avisos = useMemo(() => {
    if (!profile) return { lista: [] };

    const lista = buildMonthlyAlerts({
      perfil: profile,
      saldoMes: sobraIndividualMes
    });

    return { lista };
  }, [profile, sobraIndividualMes]);

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
          avisos={avisos}
          mensal={mensal}
          salarios={salarios}
          transactions={transactions}
          reservations={reservations}
          bills={bills}
          loans={loans}

          onGlobalSelect={() => {}}
          onOpenProfile={() => setOpenProfile(true)}
          avatarUrl={profile?.avatar_url || null}
        />

        {/* 👇 USUÁRIO LOGADO PASSADO PARA ROTAS */}
        <main style={{ flex: 1 }}>
          <Outlet context={{ usuarioLogado: profile?.display_name || null }} />
        </main>

        <Footer />

        {/* ================= DRAWERS ================= */}
        <ProfileDrawer
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          userName={profile?.display_name || "Usuário"}
          avatarUrl={profile?.avatar_url || null}
          avisos={avisos.lista}
          comparativoMensal={comparativoMensalPerfil} // 🔥 PASSANDO O COMPARATIVO
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  );
}
