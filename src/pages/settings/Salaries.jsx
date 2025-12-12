import { useEffect, useState } from "react";
import { getSalaryHistory } from "../../services/salary.service";
import { money } from "../../utils/money";
import "./Salaries.css";
import { SalaryModal } from "./SalaryModal";
import SalaryCharts from "./SalaryCharts";

export default function Salaries() {
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);

  async function carregar() {
    setLoading(true);
    const data = await getSalaryHistory();
    setSalarios(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  // ------------------------
  // SALÁRIO ATUAL
  // ------------------------
  const atual = (pessoa) => {
    return salarios
      .filter(s => s.quem.toLowerCase() === pessoa)
      .sort((a,b) => new Date(b.data) - new Date(a.data))[0];
  };

  // ------------------------
  // ÚLTIMO REAJUSTE
  // ------------------------
  const ultimoReajuste = (pessoa) => {
    const registros = salarios
      .filter(s => s.quem.toLowerCase() === pessoa)
      .sort((a,b) => new Date(a.data) - new Date(b.data));

    if (registros.length === 0) return null;

    if (registros.length === 1) {
      return {
        data: registros[0].data,
        valor: registros[0].valor,
        diff: null,
        primeiro: true
      };
    }

    const ultimo = registros[registros.length - 1];
    const anterior = registros[registros.length - 2];

    return {
      data: ultimo.data,
      valor: ultimo.valor,
      diff: ultimo.valor - anterior.valor,
      primeiro: false
    };
  };

  if (loading) {
    return <div className="card glass">Carregando salários...</div>;
  }

  return (
    <div className="card glass salaries-page">

      {/* CABEÇALHO */}
      <div className="salaries-header">
        <h2>Salários</h2>
        <button onClick={() => setShowModal(true)}>+ Novo salário</button>
      </div>

      {/* GRÁFICO */}
      <SalaryCharts salarios={salarios} />

      {/* CARDS SALÁRIO ATUAL */}
      <div className="salary-cards">
        <div className="salary-card amanda">
          <span>Amanda</span>
          <strong>{money(atual("amanda")?.valor || 0)}</strong>
        </div>

        <div className="salary-card celso">
          <span>Celso</span>
          <strong>{money(atual("celso")?.valor || 0)}</strong>
        </div>
      </div>

      {/* ÚLTIMO REAJUSTE */}
      <div className="salary-reajustes">
        {["amanda", "celso"].map(p => {
          const r = ultimoReajuste(p);
          if (!r) return null;

          return (
            <div className={`reajuste-card ${p}`} key={p}>
              <span>{p === "amanda" ? "Amanda" : "Celso"}</span>

              {r.primeiro ? (
                <small>Primeiro registro</small>
              ) : (
                <small>
                  Último reajuste: {formatarData(r.data)} —
                  <strong style={{ marginLeft: 4 }}>
                    {r.diff > 0 ? "+" : ""}
                    {money(r.diff)}
                  </strong>
                </small>
              )}
            </div>
          );
        })}
      </div>

      {/* TABELA */}
      <table className="salaries-table">
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
              onClick={() => setEdit(s)}
              style={{ cursor: "pointer" }}
            >
              <td>{formatarData(s.data)}</td>
              <td>
                <span className={`badge ${s.quem.toLowerCase()}`}>
                  {capitalize(s.quem)}
                </span>
              </td>
              <td>
                <span className="salary-value">{money(s.valor)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {(showModal || edit) && (
        <SalaryModal
          edit={edit}
          onClose={() => {
            setShowModal(false);
            setEdit(null);
          }}
          onSave={carregar}
        />
      )}

    </div>
  );
}

// ------------------------
// HELPERS
// ------------------------
function formatarData(data) {
  const d = new Date(data);
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const m = meses[d.getMonth()];
  const a = d.getFullYear().toString().slice(2);
  return `${m}/${a}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
