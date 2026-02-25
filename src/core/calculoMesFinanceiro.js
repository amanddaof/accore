import { FERIADOS_FIXOS } from "./feriados";

// Verifica se é feriado
function ehFeriado(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");

  const chave = `${dia}-${mes}`;
  return FERIADOS_FIXOS.includes(chave);
}

// Verifica se é dia útil
// ✔ Sábado conta
// ❌ Domingo não conta
// ❌ Feriado não conta
function ehDiaUtil(data) {
  const diaSemana = data.getDay(); // 0 = domingo

  if (diaSemana === 0) return false;
  if (ehFeriado(data)) return false;

  return true;
}

// Calcula 5º dia útil do mês
function calcularQuintoDiaUtil(ano, mes) {
  let contador = 0;
  let dia = 1;

  while (true) {
    const data = new Date(ano, mes, dia);

    if (ehDiaUtil(data)) {
      contador++;
      if (contador === 5) return data;
    }

    dia++;
  }
}

// Regra do mês do filtro
export function calcularMesFiltroFinanceiro() {
  const hoje = new Date();

  let anoBase = hoje.getFullYear();
  let mesBase = hoje.getMonth();

  const quintoDiaUtil = calcularQuintoDiaUtil(anoBase, mesBase);

  // Se hoje for maior que o 5º útil → próximo mês
  if (hoje > quintoDiaUtil) {
    mesBase++;

    if (mesBase > 11) {
      mesBase = 0;
      anoBase++;
    }
  }

  return { ano: anoBase, mes: mesBase };
}