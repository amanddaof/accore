import {
  buscarTodos,
  inserir,
  atualizar
} from "../../../servicos/banco";

export async function carregarCategorias() {
  const dados = await buscarTodos("categorias");

  return (dados || []).sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );
}

export async function criarCategoria(valores) {
  return await inserir("categorias", valores);
}

export async function atualizarCategoria(id, valores) {
  return await atualizar("categorias", id, valores);
}
