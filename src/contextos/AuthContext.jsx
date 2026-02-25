import { createContext, useEffect, useState } from "react";
import { supabase } from "../servicos/supabase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarSessao() {
      const { data } = await supabase.auth.getSession();
      setUsuario(data.session?.user ?? null);
      setCarregando(false);
    }

    carregarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  );
}