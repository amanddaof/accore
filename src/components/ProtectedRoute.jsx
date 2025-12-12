import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  if (session === undefined) return null; // carregando

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
