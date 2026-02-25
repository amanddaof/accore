// logica/calcularTransacoes.js

export function calcularTransacoes(transacoesMes) {

  let totalAmanda = 0;
  let totalCelso = 0;

  let gruposAmanda = { cartoes: 0, externo: 0 };
  let gruposCelso = { cartoes: 0, externo: 0 };

  transacoesMes.forEach(t => {
    const valor = Number(t.valor || 0);
    const ehExterno = t.origem === "Externo";

    if (t.quem === "Amanda") {
      totalAmanda += valor;
      ehExterno
        ? gruposAmanda.externo += valor
        : gruposAmanda.cartoes += valor;
    }

    if (t.quem === "Celso") {
      totalCelso += valor;
      ehExterno
        ? gruposCelso.externo += valor
        : gruposCelso.cartoes += valor;
    }

    if (t.quem === "Ambos") {
      totalAmanda += valor;
      totalCelso += valor;

      if (ehExterno) {
        gruposAmanda.externo += valor;
        gruposCelso.externo += valor;
      } else {
        gruposAmanda.cartoes += valor;
        gruposCelso.cartoes += valor;
      }
    }
  });

  return {
    totalAmanda,
    totalCelso,
    gruposAmanda,
    gruposCelso
  };
}