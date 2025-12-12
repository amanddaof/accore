export function calcularMediaCategorias(transactions = [], meses = 3) {
  const agora = new Date();
  const mapa = {};

  // calcula limite retroativo
  const lim = new Date();
  lim.setMonth(lim.getMonth() - meses);

  transactions.forEach(t => {
    const data = new Date(t.data || `${t.ano}-${t.mes}-01`);
    if (data < lim) return;

    const cat = t.categoria?.name || t.categoria;
    mapa[cat] ||= { total: 0, count: 0 };

    mapa[cat].total += Number(t.valor || 0);
    mapa[cat].count += 1;
  });

  return Object.entries(mapa).map(([categoria, obj]) => ({
    categoria,
    media: obj.total / meses
  }));
}
