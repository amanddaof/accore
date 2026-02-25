export function ordenarMes(a, b) {
  return parseMes(a) - parseMes(b);
}

function parseMes(texto) {
  const meses = {
    Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
    Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11
  };

  const [mes, ano] = texto.split("/");
  const anoCompleto = 2000 + Number(ano);

  return new Date(anoCompleto, meses[mes], 1).getTime();
}
