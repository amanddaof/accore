import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario, carregando } = useContext(AuthContext);
  const location = useLocation();

  if (carregando) return null;

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}