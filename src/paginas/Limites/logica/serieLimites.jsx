import { buscarTodos, atualizar } from "../../../servicos/banco";

export async function carregarLimites() {
  const dados = await buscarTodos("cartoes");

  return dados.sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function atualizarLimiteCartao(id, novoLimite) {
  return await atualizar("cartoes", id, {
    limite: novoLimite,
  });
}
