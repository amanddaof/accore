export function calcularTotaisExterno(transacoes) {
  let totalAmanda = 0;
  let totalCelso = 0;
  let totalGeral = 0;

  transacoes.forEach(t => {
    const valor = Number(t.valor || 0);

    if (t.quem === "Amanda") {
      totalAmanda += valor;
      totalGeral += valor;
    }

    if (t.quem === "Celso") {
      totalCelso += valor;
      totalGeral += valor;
    }

    if (t.quem === "Ambos") {
      totalAmanda += valor;
      totalCelso += valor;
      totalGeral += valor * 2;
    }
  });

  return {
    totalAmanda,
    totalCelso,
    totalGeral
  };
}