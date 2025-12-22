import { Routes, Route } from "react-router-dom";
import { useDashboard } from "./hooks/useDashboard";
import Layout from "./Layout";
import Profile from "./pages/Profile";

import Salaries from "./pages/settings/Salaries";
import Limits from "./pages/cards/Limits";
import Loans from "./pages/settings/Loans";
import Categories from "./pages/settings/Categories";

import Home from "./pages/Home";
import Cards from "./pages/Cards";
import Externo from "./pages/Externo";
import Reservas from "./pages/Reservas";
import ContasCasa from "./pages/ContasCasa";
import NewTransaction from "./pages/NewTransaction";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import "./theme.css";

export default function App() {
  const {
    loading,
    mes,
    setMes,

    // 🔥 DASHBOARD
    mensal,
    mensalAnterior,
    comparativoMensal, // ✅ AQUI

    dividas,
    categorias,
    cards,

    // 🔍 DADOS BRUTOS (BUSCA GLOBAL)
    transactions,
    reservations,
    bills,
    loans,

    salarios,
    reload,

    savingsGoal,
    setSavingsGoal
  } = useDashboard();

  if (loading) return <p>Carregando...</p>;

  return (
    <Routes>
      {/* 🔓 LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* 🔒 ROTAS PROTEGIDAS */}
      <Route
        element={
          <ProtectedRoute>
            <Layout
              mes={mes}
              setMes={setMes}
              reload={reload}
              cards={cards}
              mensal={mensal}
              salarios={salarios}

              /* 🔍 BUSCA GLOBAL */
              transactions={transactions}
              reservations={reservations}
              bills={bills}
              loans={loans}
            />
          </ProtectedRoute>
        }
      >
        {/* HOME */}
        <Route
          index
          element={
            <Home
              mensal={mensal}
              comparativoMensal={comparativoMensal}  
              dividas={dividas}
              categorias={categorias}
              cards={cards}
              salarios={salarios}
              loans={loans}
              mes={mes}
              savingsGoal={savingsGoal}
              setSavingsGoal={setSavingsGoal}
            />
          }
        />

        {/* PERFIL DO USUÁRIO */}
        <Route path="perfil" element={<Profile />} />

        {/* PÁGINAS */}
        <Route path="cards" element={<Cards cards={cards} />} />
        <Route path="externo" element={<Externo />} />
        <Route path="reservas" element={<Reservas />} />
        <Route path="contas" element={<ContasCasa />} />

        {/* SETTINGS */}
        <Route path="settings/cards" element={<Limits />} />
        <Route path="settings/loans" element={<Loans />} />
        <Route path="settings/categories" element={<Categories />} />
        <Route path="settings/salaries" element={<Salaries />} />

        {/* NOVO LANÇAMENTO */}
        <Route path="new" element={<NewTransaction />} />
      </Route>
    </Routes>
  );
}


