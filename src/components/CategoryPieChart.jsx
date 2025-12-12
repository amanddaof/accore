import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { money } from "../utils/money";
import "./CategoryPieChart.css";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const { categoria, valor } = payload[0].payload;

  return (
    <div className="category-tooltip">
      <div className="category-tooltip-name">{categoria}</div>
      <div className="category-tooltip-value">{money(valor)}</div>
    </div>
  );
};

export default function CategoryPieChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.valor || 0), 0);

  const sortedData = [...data]
    .filter(i => i.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  if (!sortedData.length || total === 0) {
    return <p className="chart-empty">Nenhum gasto categorizado neste período.</p>;
  }

  return (
    <div className="category-bar-wrapper">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={sortedData} layout="vertical">
          <XAxis
            type="number"
            hide
            domain={[0, "dataMax"]}
          />

          <YAxis
            type="category"
            dataKey="categoria"
            width={100}
			interval={0}
            tick={{ fill: "#CBD5E1", fontSize: 13 }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="valor"
            radius={[0, 8, 8, 0]}
            barSize={16}
          >
            {sortedData.map((entry) => (
              <Cell key={entry.categoria} fill={entry.color || "#6366F1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="category-bar-total">
        Total do mês:
        <span>{money(total)}</span>
      </div>
    </div>
  );
}
