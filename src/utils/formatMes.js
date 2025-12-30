// src/utils/formatMes.js
export function formatMes(labelISO) {
  if (!labelISO || !labelISO.includes("-")) return labelISO;

  const [ano, mes] = labelISO.split("-");
  const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  const idx = Number(mes) - 1;
  return `${nomes[idx]}/${ano.slice(2)}`; 
}
