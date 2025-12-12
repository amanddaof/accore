import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

import { money } from "../../utils/money";

// Jan/25
function fmt(date) {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const d = new Date(date);
  return `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}


// cria lista de meses contínua
function listarMeses(inicio, fim) {
  const lista = [];
  const atual = new Date(inicio);

  while (atual <= fim) {
    lista.push(new Date(atual));
    atual.setMonth(atual.getMonth() + 1);
  }

  return lista;
}


// monta série contínua com fallback
function buildSeries(rows) {
  if (!rows.length) return [];

  // ordenar por data
  const dados = [...rows]
    .sort((a,b) => new Date(a.data) - new Date(b.data));

  const primeiro = new Date(dados[0].data);
  const ultimo = new Date(dados[dados.length - 1].data);

  // meses contínuos
  const meses = listarMeses(primeiro, ultimo);

  let salarioAmanda = null;
  let salarioCelso = null;

  return meses.map(m => {

    // aplica alterações naquele mês
    dados.forEach(d => {
      const dm = new Date(d.data);
      if (dm.getFullYear() === m.getFullYear() && dm.getMonth() === m.getMonth()) {
        const pessoa = d.quem.toLowerCase();

			if (pessoa === "amanda") salarioAmanda = Number(d.valor);
			if (pessoa === "celso") salarioCelso = Number(d.valor);

      }
    });

    return {
      label: fmt(m),
      amanda: salarioAmanda,
      celso: salarioCelso
    };
  });
}


export default function SalaryCharts({ salarios }) {

  const dados = buildSeries(salarios);

  if (!dados.length) return null;

  return (
    <div className="salary-charts">

      <div className="chart-card">
        <h4>Evolução Mensal</h4>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dados}>

            <CartesianGrid stroke="rgba(255,255,255,.08)" />

            <XAxis dataKey="label" stroke="#aaa" />
            <YAxis stroke="#aaa" />

            <Tooltip formatter={v => money(v)} />

            <Line
              type="monotone"
              dataKey="amanda"
              name="Amanda"
              stroke="#8b82ff"
            />

            <Line
              type="monotone"
              dataKey="celso"
              name="Celso"
              stroke="#5fd1d1"
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}
