const meses = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

export function isoMesParaLabel(isoMes) {
  if (!isoMes || typeof isoMes !== "string") return "—";

  const [ano, mes] = isoMes.split("-");
  const index = Number(mes) - 1;

  if (index < 0 || index > 11) return "—";

  return `${meses[index]}/${ano.slice(2)}`;
}

export function mesIsoAnterior(isoMes) {
  if (!isoMes) return null;

  let [ano, mes] = isoMes.split("-").map(Number);

  mes -= 1;
  if (mes === 0) {
    mes = 12;
    ano -= 1;
  }

  return `${ano}-${String(mes).padStart(2, "0")}`;
}
