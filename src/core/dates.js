export const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function mesAbrevParaISO(mes) {
  if (!mes || !mes.includes("/")) return "";
  const mapa = {
    Jan:"01", Fev:"02", Mar:"03", Abr:"04", Mai:"05", Jun:"06",
    Jul:"07", Ago:"08", Set:"09", Out:"10", Nov:"11", Dez:"12"
  };
  const [m, a] = mes.split("/");
  return `20${a}-${mapa[m]}`;
}

export function isoParaMesAbrev(iso) {
  if (!iso) return null;
  const [ano, mes] = iso.split("-");
  return `${MESES[parseInt(mes)-1]}/${ano.slice(2)}`;
}

export function incrementarMes(mes, incremento = 1) {
  if (!mes) return mes;
  const [m, a] = mes.split("/");
  let idx = MESES.indexOf(m);
  let ano = Number("20" + a);

  idx += incremento;
  while (idx > 11) {
    idx -= 12;
    ano++;
  }

  return `${MESES[idx]}/${ano.toString().slice(-2)}`;
}

// src/core/dates.js

export function dataRealParaMesAbrev(dataReal) {
  if (!dataReal) return null;

  const data = new Date(dataReal);
  const meses = [
    "Jan","Fev","Mar","Abr","Mai","Jun",
    "Jul","Ago","Set","Out","Nov","Dez"
  ];

  const mes = meses[data.getMonth()];
  const ano = String(data.getFullYear()).slice(2);

  return `${mes}/${ano}`;
}
