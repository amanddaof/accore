function numeroSeguro(valor) {
  const n = Number(valor);
  return isNaN(n) ? 0 : n;
}

function normalizar(texto) {
  return (texto || "").toString().trim().toLowerCase();
}

function valorComMultiplicador(t) {
  const valor = numeroSeguro(t.valor);
  const quem = normalizar(t.quem);

  if (quem === "ambos") return valor * 2;
  return valor;
}

export function calcularResumoCartao(cartao, mesFiltro, transacoes = []) {
  console.log("🔍 FUNÇÃO calcularResumoCartao CHAMADA");

  if (!cartao) return null;

  const limite = numeroSeguro(cartao.limite);

  let faturaMes = 0;
  let usadoGlobal = 0;
  let amanda = 0;
  let celso = 0;

  const nomeCartao = normalizar(cartao.nome);
  const mesAtual = normalizar(mesFiltro);

  console.log("🪪 CARTÃO:", nomeCartao);
  console.log("🗓 FILTRO:", mesAtual);

  transacoes.forEach(t => {
    const origem = normalizar(t.origem);
    const status = normalizar(t.status);
    const mes = normalizar(t.mes);
    const quem = normalizar(t.quem);
    const valor = numeroSeguro(t.valor);

    console.log({
  origemBanco: t.origem,
  origemNormalizada: origem,
  nomeCartao,
  mesBanco: t.mes,
  mesNormalizado: mes,
  mesFiltro: mesAtual,
  status: t.status
});


    if (origem !== nomeCartao) return;

    console.log("➡️ TRANSACAO DO CARTAO:", {
      mes,
      status,
      valor
    });

    // limite global
    if (status === "pendente") {
      usadoGlobal += valorComMultiplicador(t);
    }

    // fatura do mês
    if (mes === mesAtual && status === "pendente") {
      console.log("🔥 ENTRANDO NA FATURA DO MÊS");
      faturaMes += valorComMultiplicador(t);
    }

    // divisão por pessoa
    if (mes === mesAtual) {
      if (quem === "amanda") amanda += valor;
      else if (quem === "celso") celso += valor;
      else if (quem === "ambos") {
        amanda += valor;
        celso += valor;
      }
    }
  });

  const disponivel = Math.max(limite - usadoGlobal, 0);
  const percentualUso = limite
    ? Math.round((usadoGlobal / limite) * 100)
    : 0;

  console.log("📊 RESULTADO:", {
    faturaMes,
    usadoGlobal,
    disponivel
  });

  return {
    limite,
    faturaMes,
    usadoGlobal,
    disponivel,
    percentualUso,
    porPessoa: {
      Amanda: amanda,
      Celso: celso
    }
  };
}

export function obterParcelasDoMes(cartao, mesFiltro, transacoes = []) {
  const nomeCartao = normalizar(cartao?.nome);
  const mesAtual = normalizar(mesFiltro);

  return transacoes
    .filter(t =>
      normalizar(t.origem) === nomeCartao &&
      normalizar(t.mes) === mesAtual
    )
    .sort((a, b) => b.id - a.id);
}
