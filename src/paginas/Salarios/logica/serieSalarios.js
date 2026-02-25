export function montarSerie(salarios) {
  if (!salarios.length) return [];

  const ordenados = [...salarios]
    .sort((a,b) => new Date(a.data) - new Date(b.data));

  const primeiro = new Date(ordenados[0].data);
  const ultimo = new Date(ordenados.at(-1).data);

  const meses = [];
  const atual = new Date(primeiro);

  while (atual <= ultimo) {
    meses.push(new Date(atual));
    atual.setMonth(atual.getMonth() + 1);
  }

  let salarioAmanda = null;
  let salarioCelso = null;

  return meses.map(m => {

    ordenados.forEach(d => {
      const dm = new Date(d.data);
      if (
        dm.getFullYear() === m.getFullYear() &&
        dm.getMonth() === m.getMonth()
      ) {
        const pessoa = d.quem.toLowerCase();
        if (pessoa === "amanda") salarioAmanda = Number(d.valor);
        if (pessoa === "celso") salarioCelso = Number(d.valor);
      }
    });

    return {
      label: formatarMes(m),
      amanda: salarioAmanda,
      celso: salarioCelso
    };
  });
}

function formatarMes(date) {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${meses[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
}
