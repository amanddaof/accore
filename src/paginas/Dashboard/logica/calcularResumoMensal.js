import { buscarTodos } from "../../../servicos/banco";

/**
 * Calcula resumo financeiro do mês
 */
export async function calcularResumoMensal(mesSelecionado) {

  const [
    transacoes,
    reservas,
    contas,
    emprestimos,
    historicoSalarios
  ] = await Promise.all([
    buscarTodos("transacoes"),
    buscarTodos("reservas"),
    buscarTodos("contas"),
    buscarTodos("emprestimos"),
    buscarTodos("historico_salarios")
  ]);

  // ===============================
  // 🔹 SALÁRIOS
  // ===============================

  const salarioAmanda =
    historicoSalarios.find(s => s.mes === mesSelecionado && s.pessoa === "Amanda")?.valor || 0;

  const salarioCelso =
    historicoSalarios.find(s => s.mes === mesSelecionado && s.pessoa === "Celso")?.valor || 0;

  let totalAmanda = 0;
  let totalCelso = 0;

  // ===============================
  // 🔹 TRANSAÇÕES (Cartões + Externo)
  // ===============================

  transacoes
    .filter(t => t.mes === mesSelecionado)
    .forEach(t => {

      const valor = Number(t.valor);

      if (t.quem === "Amanda") totalAmanda += valor;
      else if (t.quem === "Celso") totalCelso += valor;
      else if (t.quem === "Ambos") {
        totalAmanda += valor;
        totalCelso += valor;
      }

    });

  // ===============================
  // 🔹 RESERVAS (somente não concluídas)
  // ===============================

  reservas
    .filter(r =>
      r.mes === mesSelecionado &&
      r.recorrencia !== "Concluída"
    )
    .forEach(r => {

      const valor = Number(r.valor);

      if (r.quem === "Amanda") totalAmanda += valor;
      else if (r.quem === "Celso") totalCelso += valor;
      else if (r.quem === "Ambos") {
        totalAmanda += valor;
        totalCelso += valor;
      }

    });

  // ===============================
  // 🔹 CONTAS DA CASA (50/50)
  // ===============================

  contas
    .filter(c =>
      c.mes === mesSelecionado &&
      c.tipo === "casa"
    )
    .forEach(c => {

      const metade = Number(c.valor) / 2;

      totalAmanda += metade;
      totalCelso += metade;

    });

  // ===============================
  // 🔹 EMPRÉSTIMOS
  // ===============================

  emprestimos
    .filter(e => e.mes === mesSelecionado)
    .forEach(e => {

      const valor = Number(e.valor);

      // Todos impactam financeiramente Celso
      totalCelso += valor;

    });

  return {
    amanda: {
      salario: salarioAmanda,
      comprometido: totalAmanda,
      sobra: salarioAmanda - totalAmanda
    },
    celso: {
      salario: salarioCelso,
      comprometido: totalCelso,
      sobra: salarioCelso - totalCelso
    }
  };
}