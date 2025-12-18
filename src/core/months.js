const ordemMeses = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

export function mesAnteriorLabel(mesAtual) {
  if (!mesAtual) return null;

  const [mesAbrev, anoCurto] = mesAtual.split("/");

  const index = ordemMeses.indexOf(mesAbrev);
  if (index === -1) return null;

  if (index === 0) {
    return `Dez/${String(Number(anoCurto) - 1).padStart(2, "0")}`;
  }

  return `${ordemMeses[index - 1]}/${anoCurto}`;
}
