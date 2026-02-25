// logica/calcularDividas.js

export function calcularDividas({
  transacoesMes,
  contasMes,
  emprestimosMes
}) {

  let saldo = 0; // positivo = Amanda deve | negativo = Celso deve
  let detalhamento = [];

  const pessoasValidas = ["Amanda", "Celso"];

  /* =========================
     1️⃣ TRANSAÇÕES
  ========================= */

    transacoesMes.forEach(t => {

    if (!t.quem || !t.quem_paga) return;

    const valor = Number(t.valor || 0);

    // Ignora terceiros
    if (
        !["Amanda", "Celso", "Ambos"].includes(t.quem) ||
        !["Amanda", "Celso"].includes(t.quem_paga)
    ) return;

    // =====================
    // CASO 1: Ambos
    // =====================
    if (t.quem === "Ambos") {

        if (t.quem_paga === "Amanda") {
        // Celso deve valor inteiro
        saldo -= valor;

        detalhamento.push({
            tipo: "Transação",
            descricao: t.descricao,
            quem: "Celso",
            quem_paga: "Amanda",
            valor
        });
        }

        if (t.quem_paga === "Celso") {
        // Amanda deve valor inteiro
        saldo += valor;

        detalhamento.push({
            tipo: "Transação",
            descricao: t.descricao,
            quem: "Amanda",
            quem_paga: "Celso",
            valor
        });
        }

        return;
    }

    // =====================
    // CASO 2: Individual
    // =====================

    if (t.quem === t.quem_paga) return;

    if (t.quem === "Amanda" && t.quem_paga === "Celso") {
        saldo += valor;
    }

    if (t.quem === "Celso" && t.quem_paga === "Amanda") {
        saldo -= valor;
    }

    detalhamento.push({
        tipo: "Transação",
        descricao: t.descricao,
        quem: t.quem,
        quem_paga: t.quem_paga,
        valor
    });

    });

  /* =========================
     2️⃣ CONTAS DA CASA
     50/50 - paga Celso
  ========================= */

  contasMes.forEach(c => {

    const valorReal = Number(c.valor_real || 0);
    const valorPrevisto = Number(c.valor_previsto || 0);
    const valor = valorReal > 0 ? valorReal : valorPrevisto;

    const metade = valor / 2;

    saldo += metade; // Amanda deve metade

    detalhamento.push({
      tipo: "Conta da casa",
      descricao: c.conta,
      quem: "Amanda",
      quem_paga: "Celso",
      valor: metade
    });
  });

  /* =========================
     3️⃣ EMPRÉSTIMO NUBANK
     Pago por Amanda
  ========================= */

  emprestimosMes.forEach(e => {

    if (!e.descricao?.toLowerCase().includes("nubank")) return;

    const valor = Number(e.valor || 0);

    saldo -= valor; // Celso deve para Amanda

    detalhamento.push({
      tipo: "Empréstimo",
      descricao: e.descricao,
      quem: "Celso",
      quem_paga: "Amanda",
      valor
    });
  });

  /* =========================
   4️⃣ RESULTADO FINAL
========================= */

let saldoFinal = {
  quemDeve: null,
  quemRecebe: null,
  valor: 0
};

if (saldo > 0) {
  saldoFinal = {
    quemDeve: "Amanda",
    quemRecebe: "Celso",
    valor: saldo
  };
} else if (saldo < 0) {
  saldoFinal = {
    quemDeve: "Celso",
    quemRecebe: "Amanda",
    valor: Math.abs(saldo)
  };
}

return {
  saldoFinal,
  detalhamento
};
}
