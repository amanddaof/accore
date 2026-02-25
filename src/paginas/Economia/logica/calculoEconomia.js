// ===============================
// EXTRAIR ANO E MÊS DO FILTRO
// ===============================

export function extrairAnoEMes(mesSelecionado) {
  if (!mesSelecionado) return null;

  const [mesAbrev, anoDoisDigitos] = mesSelecionado.split("/");

  const mapaMes = {
    Jan: 1,
    Fev: 2,
    Mar: 3,
    Abr: 4,
    Mai: 5,
    Jun: 6,
    Jul: 7,
    Ago: 8,
    Set: 9,
    Out: 10,
    Nov: 11,
    Dez: 12
  };

  const mesNumero = mapaMes[mesAbrev];
  const anoCompleto = Number(`20${anoDoisDigitos}`);

  return {
    ano: anoCompleto,
    mes: mesNumero
  };
}

// ===============================
// CÁLCULO DE STATUS DA META
// ===============================

export function calcularStatusMeta({
  anoSelecionado,
  mesSelecionadoNumero,
  registros,
  valorMeta
}) {

  const anoAtual = new Date().getFullYear();
  const mesAtualReal = new Date().getMonth() + 1;

  const totalGuardado = registros.reduce(
    (acc, r) => acc + Number(r.economizado_real || 0),
    0
  );

  // ===============================
  // ANO PASSADO
  // ===============================

  if (anoSelecionado < anoAtual) {
    return {
      tipo: "passado",
      totalGuardado,
      vaiBaterMeta: totalGuardado >= valorMeta
    };
  }

  // ===============================
  // ANO ATUAL
  // ===============================

  if (anoSelecionado === anoAtual) {

    const mesReferencia = mesAtualReal;
    const mesesFechados = mesReferencia - 1;

    if (mesesFechados <= 0) {
      return {
        tipo: "atual-sem-dados",
        totalGuardado
      };
    }

    const totalMesesFechados = registros
      .filter(r => Number(r.mes) < mesReferencia)
      .reduce(
        (acc, r) => acc + Number(r.economizado_real || 0),
        0
      );

    const media = totalMesesFechados / mesesFechados;
    const projecao = media * 12;

    // Ritmo ideal
    const valorEsperado = (valorMeta / 12) * mesesFechados;

    let ritmo = "neutro";

    if (totalMesesFechados > valorEsperado) {
      ritmo = "acima";
    } else if (totalMesesFechados < valorEsperado) {
      ritmo = "abaixo";
    } else {
      ritmo = "no-ritmo";
    }

    return {
      tipo: "atual",
      totalGuardado,
      projecao,
      vaiBaterMeta: projecao >= valorMeta,
      ritmo,
      valorEsperado
    };
  }

  return {
    tipo: "futuro",
    totalGuardado
  };
}
