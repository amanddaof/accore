import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contextos/AuthContext";
import { AuthProvider } from "./contextos/AuthContext";
import PrivateRoute from "./rotas/PrivateRoute";

import { useEffect } from "react";
import { buscarTodos, inserir, atualizar } from "./servicos/banco";
import {
  avancarDataReserva,
  avancarMesReserva,
  avancarParcelaReserva
} from "./paginas/Reservas/logica/recorrenciaReserva";

import { processarReservasAutomaticamente } from "./core/processamentoAutomaticoReservas";

import Cabecalho from "./componentes/Cabecalho";
import Rodape from "./componentes/Rodape";

import Dashboard from "./paginas/Dashboard/index";
import Cartoes from "./paginas/Cartoes/index";
import Externo from "./paginas/Externo/index";
import Reservas from "./paginas/Reservas/index";
import Casa from "./paginas/Casa/index";
import Economia from "./paginas/Economia/index";
import Entradas from "./paginas/Entradas/index";
import Emprestimos from "./paginas/Emprestimos/index";
import Salarios from "./paginas/Salarios/index";
import Limites from "./paginas/Limites/index";
import Categorias from "./paginas/Categorias/index";
import Perfil from "./paginas/Perfil";

import Login from "./paginas/Login";

function Layout() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const { usuario, carregando } = useContext(AuthContext);

  useEffect(() => {
  if (!usuario) return;

  const hoje = new Date();
  const hojeFormatado =
    hoje.getFullYear() + "-" +
    String(hoje.getMonth() + 1).padStart(2, "0") + "-" +
    String(hoje.getDate()).padStart(2, "0");

  const ultimaExecucao = localStorage.getItem("reservas_processadas");

  if (ultimaExecucao === hojeFormatado) return;

  async function rodarProcessamento() {
    await processarReservasAutomaticamente({
      buscarTodos,
      inserir,
      atualizar,
      avancarDataReserva,
      avancarMesReserva
    });

    localStorage.setItem("reservas_processadas", hojeFormatado);
  }

  rodarProcessamento();

}, [usuario]);

  if (carregando) return null;

  return (
    <>
      {!isLogin && <Cabecalho />}

      <Routes>
        <Route
          path="/"
          element={
            usuario ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/login"
          element={
            usuario ? <Navigate to="/dashboard" /> : <Login />
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route path="/cartoes" element={<PrivateRoute><Cartoes /></PrivateRoute>} />
        <Route path="/externo" element={<PrivateRoute><Externo /></PrivateRoute>} />
        <Route path="/reservas" element={<PrivateRoute><Reservas /></PrivateRoute>} />
        <Route path="/casa" element={<PrivateRoute><Casa /></PrivateRoute>} />
        <Route path="/economia" element={<PrivateRoute><Economia /></PrivateRoute>} />
        <Route path="/entrada" element={<PrivateRoute><Entradas /></PrivateRoute>} />
        <Route path="/emprestimos" element={<PrivateRoute><Emprestimos /></PrivateRoute>} />
        <Route path="/salarios" element={<PrivateRoute><Salarios /></PrivateRoute>} />
        <Route path="/limites" element={<PrivateRoute><Limites /></PrivateRoute>} />
        <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      </Routes>

      {!isLogin && <Rodape />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );

}
