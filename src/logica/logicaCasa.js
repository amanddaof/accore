import { inserir } from "../servicos/banco";

export async function salvarNovaConta(dados) {

  if (!dados.mes || !dados.conta || !dados.valor_previsto) {
    alert("Preencha os campos obrigatórios");
    return null;
  }

  const contaFormatada = {
    mes: dados.mes,
    conta: dados.conta,
    valor_previsto: Number(dados.valor_previsto),
    valor_real: dados.valor_real
      ? Number(dados.valor_real)
      : null,
    status: dados.status || "Pendente"
  };

  try {
    return await inserir("contas", contaFormatada);
  } catch (error) {
    console.error("Erro ao salvar conta:", error);
    alert("Erro ao salvar conta.");
    return null;
  }
}
