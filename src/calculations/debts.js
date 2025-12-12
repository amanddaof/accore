import { isoParaMesAbrev } from "../core/dates";
import { safeNumber } from "../core/helpers";


// ========================
// 💸 DÍVIDAS ENTRE PESSOAS
// ========================
export function calcularDividasMes(
  mesFiltroISO,
  { transactions = [], bills = [], loans = [], reservas = [] }
) {

  const mesFmt = isoParaMesAbrev(mesFiltroISO);

  let deveAmanda = 0;
  let deveCelso = 0;
  const detalhes = [];

  const todos = [...transactions, ...reservas];

  todos.forEach(item => {
    if (!item.mes || item.mes !== mesFmt) return;
    if (!item.quem || !item.quem_paga) return;

    const valor = safeNumber(item.valor);
    let devedor = null;
    let credor = null;

    if (item.quem === "Amanda" && item.quem_paga === "Celso") {
      deveAmanda += valor;
      devedor = "Amanda"; credor = "Celso";
    }

    if (item.quem === "Celso" && item.quem_paga === "Amanda") {
      deveCelso += valor;
      devedor = "Celso"; credor = "Amanda";
    }

    if (item.quem === "Ambos") {
      if (item.quem_paga === "Amanda") {
        deveCelso += valor;
        devedor = "Celso"; credor = "Amanda";
      }
      if (item.quem_paga === "Celso") {
        deveAmanda += valor;
        devedor = "Amanda"; credor = "Celso";
      }
    }

    if (devedor && credor) {
      detalhes.push({
        tipo: item.tipo || "Lançamento",
        origem: item.origem || "-",
        devedor,
        credor,
        valor,
        descricao: item.descricao || ""
      });
    }
  });

  // contas da casa — Amanda reembolsa metade
  bills.forEach(b => {
    if (b.mes !== mesFmt) return;
    const valor = safeNumber(b.valor_real) || safeNumber(b.valor_previsto || 0);
    const metade = valor / 2;
    deveAmanda += metade;

    detalhes.push({
      tipo: "Conta da casa",
      origem: b.conta || "Conta da Casa",
      devedor: "Amanda",
      credor: "Celso",
      valor: metade,
      descricao: b.conta || ""
    });
  });

  // empréstimos Nubank — Celso → Amanda
  loans.forEach(l => {
    if (l.mes === mesFmt && l.descricao?.toLowerCase().includes("nubank")) {
      const valor = safeNumber(l.valor);
      deveCelso += valor;

      detalhes.push({
        tipo: "Empréstimo",
        origem: "Nubank",
        devedor: "Celso",
        credor: "Amanda",
        valor,
        descricao: l.descricao || ""
      });
    }
  });

  if (deveAmanda > deveCelso) {
    return { devedor: "Amanda", credor: "Celso", valor: deveAmanda - deveCelso, detalhes };
  }

  if (deveCelso > deveAmanda) {
    return { devedor: "Celso", credor: "Amanda", valor: deveCelso - deveAmanda, detalhes };
  }

  return { devedor: null, credor: null, valor: 0, detalhes };
}
