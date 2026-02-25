import { useEffect, useState } from "react";
import { buscarTodos } from "../../servicos/banco";
import ModalSalario from "./ModalSalario";
import GraficoSalarios from "./componentes/GraficoSalarios";
import money from "../../utils/money";
import "./estilos/salarios.css";

export default function Salarios() {

  const [salarios, setSalarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const dados = await buscarTodos("historico_salarios");
    setSalarios(dados || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function salarioAtual(pessoa) {
    return salarios
      .filter(s => s.quem.toLowerCase() === pessoa)
      .sort((a,b) => new Date(b.data) - new Date(a.data))[0];
  }

  if (carregando) {
    return (
      <div className="pagina-salarios">
        <div className="card-salario">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="pagina-salarios">

      <div className="cabecalho-salarios">
        <h1>Salários</h1>
        <button
          className="btn-primario"
          onClick={() => setMostrarModal(true)}
        >
          + Novo salário
        </button>
      </div>

      <GraficoSalarios salarios={salarios} />

      <div className="cards-salarios">
        <div className="card-salario amanda">
          <span>Amanda</span>
          <strong>{money(salarioAtual("amanda")?.valor || 0)}</strong>
        </div>

        <div className="card-salario celso">
          <span>Celso</span>
          <strong>{money(salarioAtual("celso")?.valor || 0)}</strong>
        </div>
      </div>

      <table className="tabela-salarios">
        <thead>
          <tr>
            <th>Mês/Ano</th>
            <th>Pessoa</th>
            <th>Valor</th>
          </tr>
        </thead>

        <tbody>
          {salarios.map(s => (
            <tr
              key={s.id}
              onClick={() => setEditando(s)}
            >
              <td>{formatarData(s.data)}</td>
              <td>
                <span className={`badge ${s.quem.toLowerCase()}`}>
                  {capitalizar(s.quem)}
                </span>
              </td>
              <td>{money(s.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {(mostrarModal || editando) && (
        <ModalSalario
          edit={editando}
          fechar={() => {
            setMostrarModal(false);
            setEditando(null);
          }}
          atualizar={carregar}
        />
      )}

    </div>
  );
}

function formatarData(data) {
  const d = new Date(data);
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
