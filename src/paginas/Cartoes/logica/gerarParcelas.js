function definirQuemPaga(nomeCartao = "") {
  const n = nomeCartao.toLowerCase();

  if (n.includes("amanda")) return "Amanda";
  if (n.includes("celso")) return "Celso";

  return null;
}

export function gerarParcelas(novaCompra, nomeCartao) {
  const partes = novaCompra.parcelas.split("/");
  const totalParcelas = Number(partes[1] || 1);
  const valor = Number(novaCompra.valor);

  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const [mesTextoBase, anoBase] = novaCompra.mes.split("/");

  const indiceMes = meses.findIndex(
    m => m.toLowerCase() === mesTextoBase.toLowerCase()
  );

  if (indiceMes === -1) {
    throw new Error("Mês inválido. Use formato Fev/26");
  }

  const anoNumero = Number("20" + anoBase);

  const compras = [];

  for (let i = 0; i < totalParcelas; i++) {
    const dataBase = new Date(novaCompra.data_real + "T00:00:00");
    dataBase.setMonth(dataBase.getMonth() + i);

    const mesIndexAtual = (indiceMes + i) % 12;
    const anoIncrementado = anoNumero + Math.floor((indiceMes + i) / 12);

    const mesGerado =
      `${meses[mesIndexAtual]}/${String(anoIncrementado).slice(-2)}`;

    compras.push({
        descricao: novaCompra.descricao,
        valor: valor,
        data_real: dataBase.toISOString().split("T")[0],
        parcelas: `${i + 1}/${totalParcelas}`,
        mes: mesGerado,
        quem: novaCompra.quem,
        quem_paga: definirQuemPaga(nomeCartao), // 👈 NOVO
        status: novaCompra.status,
        category_id: novaCompra.categoria,
        origem: nomeCartao
        });
  }

  return compras;
}
