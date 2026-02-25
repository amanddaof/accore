export function gerarParcelasExterno(novaDespesa) {
  const partes = novaDespesa.parcelas.split("/");
  const totalParcelas = Number(partes[1] || 1);
  const valor = Number(novaDespesa.valor);

  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const [mesTextoBase, anoBase] = novaDespesa.mes.split("/");

  const indiceMes = meses.findIndex(
    m => m.toLowerCase() === mesTextoBase.toLowerCase()
  );

  if (indiceMes === -1) {
    throw new Error("Mês inválido. Use formato Fev/26");
  }

  const anoNumero = Number("20" + anoBase);
  const despesas = [];

  for (let i = 0; i < totalParcelas; i++) {
    const dataBase = new Date(novaDespesa.data_real + "T00:00:00");
    dataBase.setMonth(dataBase.getMonth() + i);

    const mesIndexAtual = (indiceMes + i) % 12;
    const anoIncrementado = anoNumero + Math.floor((indiceMes + i) / 12);

    const mesGerado =
      `${meses[mesIndexAtual]}/${String(anoIncrementado).slice(-2)}`;

    despesas.push({
      descricao: novaDespesa.descricao,
      valor,
      data_real: dataBase.toISOString().split("T")[0],
      parcelas: `${i + 1}/${totalParcelas}`,
      mes: mesGerado,
      quem: novaDespesa.quem,
      quem_paga: novaDespesa.quem_paga,
      status: novaDespesa.status,
      category_id: novaDespesa.categoria,
      origem: "Externo"
    });
  }

  return despesas;
}
