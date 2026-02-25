import { useEffect, useState } from "react";
import { buscarTodos, atualizar } from "../../servicos/banco";
import CardEmprestimo from "./componentes/CardEmprestimo";
import { ordenarMes } from "./logica/ordenarMes";
import "./estilos/emprestimos.css";

export default function Emprestimos() {

  const [anoAtivo, setAnoAtivo] = useState("todos");
  const [parcelas, setParcelas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const dados = await buscarTodos("emprestimos");
    setParcelas(dados || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function pagarParcela(id) {
    await atualizar("emprestimos", id, { status: "Pago" });

    setParcelas(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: "Pago" } : p
      )
    );
  }

  if (carregando) {
    return (
      <div className="pagina-emprestimos">
        <div className="card-emprestimo">
          Carregando empréstimos...
        </div>
      </div>
    );
  }

  const agrupados = parcelas.reduce((acc, p) => {
    if (!acc[p.descricao]) {
      acc[p.descricao] = [];
    }
    acc[p.descricao].push(p);
    return acc;
  }, {});

  const anosDisponiveis = [
    ...new Set(
      parcelas.map(p => "20" + p.mes.split("/")[1])
    )
  ].sort();

  return (
    <div className="pagina-emprestimos">
      <div className="cabecalho-emprestimos">
        <h1>Empréstimos</h1>

        <select
          value={anoAtivo}
          onChange={e => setAnoAtivo(e.target.value)}
          className="filtro-ano"
        >
          <option value="todos">Todos</option>
          {anosDisponiveis.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="lista-emprestimos">
        {Object.entries(agrupados).map(([descricao, lista]) => (
          <CardEmprestimo
            key={descricao}
            descricao={descricao}
            parcelas={lista}
            anoAtivo={anoAtivo}
            pagarParcela={pagarParcela}
          />
        ))}
      </div>
    </div>
  );
}
