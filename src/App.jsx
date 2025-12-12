import { Routes, Route } from "react-router-dom";
import { useDashboard } from "./hooks/useDashboard";
import Layout from "./Layout";

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
    mensal,
    dividas,
    categorias,
    cards,
    transactions,
    salarios,
    cofre,
    loans,
    reload
  } = useDashboard();

  if (loading) return <p>Carregando...</p>;

  return (
    <Routes>

      {/** 🔓 ROTA SEM LOGIN NECESSÁRIO */}
      <Route path="/login" element={<Login />} />

      {/** 🔒 ROTAS PROTEGIDAS */}
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
              transactions={transactions}
            />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <Home
              mensal={mensal}
              dividas={dividas}
              categorias={categorias}
              cards={cards}
              salarios={salarios}
              cofre={cofre}
              loans={loans}
              mes={mes}
            />
          }
        />

        <Route path="cards" element={<Cards cards={cards} />} />
        <Route path="externo" element={<Externo />} />
        <Route path="reservas" element={<Reservas />} />
        <Route path="contas" element={<ContasCasa />} />

        <Route path="settings/cards" element={<Limits />} />
        <Route path="settings/loans" element={<Loans />} />
        <Route path="settings/categories" element={<Categories />} />
        <Route path="settings/salaries" element={<Salaries />} />

        <Route path="new" element={<NewTransaction />} />

      </Route>
    </Routes>
  );
}
