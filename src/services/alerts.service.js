import { calcularMediaCategorias } from "./alerts.analysis";

export function gerarAlertas({ mensal, salarios, transactions }) {

  const alertas = {
    amanda: [],
    celso: [],
    geral: []
  };

  const sobraAmanda = Number(salarios?.amanda?.sobra);
  const sobraCelso = Number(salarios?.celso?.sobra);

  const salarioTotal =
    (salarios?.amanda?.salario || 0) +
    (salarios?.celso?.salario || 0);

  const gastoAtual = mensal?.total || 0;
  const proj = Number(mensal?.projecao?.projecaoFinal);

  // =================
  // ALERTAS EXISTENTES
  // =================

  if (!isNaN(sobraAmanda) && sobraAmanda < 0) {
    alertas.amanda.push({ tipo: "critico", msg: "Déficit neste mês" });
  }

  if (!isNaN(sobraAmanda) && sobraAmanda < salarios.amanda.salario * 0.1) {
    alertas.amanda.push({ tipo: "atencao", msg: "Sobra muito baixa" });
  }

  if (!isNaN(sobraCelso) && sobraCelso < 0) {
    alertas.celso.push({ tipo: "critico", msg: "Déficit neste mês" });
  }

  if (!isNaN(sobraCelso) && sobraCelso < salarios.celso.salario * 0.1) {
    alertas.celso.push({ tipo: "atencao", msg: "Sobra muito baixa" });
  }

  if (!isNaN(proj) && proj > salarioTotal) {
    alertas.geral.push({ tipo: "critico", msg: "Projeção indica déficit no mês" });
  }

  if (!isNaN(proj) && proj > gastoAtual * 1.15) {
    alertas.geral.push({ tipo: "atencao", msg: "Gastos estão acima do ritmo normal" });
  }

  // ======================
  // ALERTAS POR CATEGORIA
  // ======================

  if (Array.isArray(transactions) && transactions.length) {

    const medias = calcularMediaCategorias(transactions, 3);

    const atual = {};
    transactions.forEach(t => {
      const mesAtual = t.mes;
      if (mesAtual !== mensal?.mes) return;

      const cat = t.categoria?.name || t.categoria;
      atual[cat] = (atual[cat] || 0) + Number(t.valor || 0);
    });

    medias.forEach(m => {
      const valor = atual[m.categoria] || 0;
      if (valor > m.media * 1.5) {
        alertas.geral.push({
          tipo: "atencao",
          msg: `Gasto fora da média em ${m.categoria}`
        });
      }
    });
  }

  // FALLBACK
  if (!alertas.amanda.length) alertas.amanda.push({ tipo: "ok", msg: "Tudo sob controle" });
  if (!alertas.celso.length) alertas.celso.push({ tipo: "ok", msg: "Tudo sob controle" });
  if (!alertas.geral.length) alertas.geral.push({ tipo: "ok", msg: "Situação estável" });

  return alertas;
}
