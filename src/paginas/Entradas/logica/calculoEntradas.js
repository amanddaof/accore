export function calcularResumo(recebimentos, totalVenda) {
  const totalRecebido = recebimentos.reduce(
    (soma, r) => soma + Number(r.valor || 0),
    0
  );

  const falta = totalVenda - totalRecebido;

  const percentual = totalVenda
    ? Math.round((totalRecebido / totalVenda) * 100)
    : 0;

  const concluido = percentual >= 100;

  return {
    totalRecebido,
    falta,
    percentual,
    concluido,
  };
}
