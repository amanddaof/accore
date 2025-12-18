const ordemMeses = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

export function mesAnteriorLabel(mesAtual) {
  if (!mesAtual || typeof mesAtual !== "string") return null;

  // normaliza: remove espaços e padroniza
  const normalizado = mesAtual.replace(/\s/g, "");

  const [mesAbrevRaw, anoCurto] = normalizado.split("/");
  if (!mesAbrevRaw || !anoCurto) return null;

  const mesAbrev =
    mesAbrevRaw.charAt(0).toUpperCase() +
    mesAbrevRaw.slice(1, 3).toLowerCase();

  const index = ordemMeses.indexOf(mesAbrev);
  if (index === -1) return null;

  if (index === 0) {
    return `Dez/${String(Number(anoCurto) - 1).padStart(2, "0")}`;
  }

  return `${ordemMeses[index - 1]}/${anoCurto}`;
}
