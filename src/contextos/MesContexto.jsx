import { createContext, useContext, useState } from "react";
import { calcularMesFiltroFinanceiro } from "../core/calculoMesFinanceiro";

const MesContexto = createContext(null);

// Array simples de meses
const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function MesProvider({ children }) {
  const { ano, mes } = calcularMesFiltroFinanceiro();

  const mesInicial = `${MESES[mes]}/${String(ano).slice(-2)}`;

  const [mesSelecionado, setMesSelecionado] = useState(mesInicial);

  return (
    <MesContexto.Provider value={{ mesSelecionado, setMesSelecionado }}>
      {children}
    </MesContexto.Provider>
  );
}

export function useMes() {
  const contexto = useContext(MesContexto);
  if (!contexto) {
    throw new Error("useMes deve ser usado dentro de MesProvider");
  }
  return contexto;
}