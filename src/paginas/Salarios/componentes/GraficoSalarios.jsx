import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import money from "../../../utils/money";
import { montarSerie } from "../logica/serieSalarios";

export default function GraficoSalarios({ salarios }) {

  const dados = montarSerie(salarios);

  if (!dados.length) return null;

  return (
    <div className="grafico-salarios">

      <div className="card-grafico">

        <h4>Evolução mensal</h4>

        <ResponsiveContainer width="100%" height={260}>
  <LineChart
    data={dados}
    margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
  >

            <CartesianGrid stroke="rgba(255,255,255,.06)" />

            <YAxis
  stroke="#A7A9D6"
  tickFormatter={(v) => money(v)}
  width={80}
/>

            <YAxis
              stroke="#A7A9D6"
              tickFormatter={(v) => money(v)}
            />

            <Tooltip
              formatter={(v) => money(v)}
              contentStyle={{
                background: "#1A184A",
                border: "1px solid #221F63",
                borderRadius: 12,
                color: "#F2F3FF"
              }}
            />

            <Line
              type="monotone"
              dataKey="amanda"
              name="Amanda"
              stroke="#F5C97A"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="celso"
              name="Celso"
              stroke="#7AA2F7"
              strokeWidth={2}
              dot={false}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}
