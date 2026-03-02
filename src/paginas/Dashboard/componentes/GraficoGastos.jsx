import {
  Chart as ChartJS,
  ArcElement,
  Tooltip
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useState, useRef } from "react";

ChartJS.register(ArcElement, Tooltip);

export default function GraficoGastos({ dados, onAbrirReservas }) {

  const chartRef = useRef();
  const [segmentoAtivo, setSegmentoAtivo] = useState(null);

  const grupos = dados?.grupos || {};
  const sobra = dados?.sobra || 0;

  const estrutura = { ...grupos };

  if (sobra > 0) {
    estrutura.sobra = sobra;
  }

  const labels = Object.keys(estrutura).filter(
    key => estrutura[key] > 0
  );

  const valores = labels.map(label => estrutura[label]);

  const coresBase = {
    cartoes: "#3B82F6",
    externo: "#1F2937",
    reservas: "#FBBF24",
    casa: "#8B5CF6",
    emprestimos: "#CBD5E1",
    sobra: "#10B981"
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: (context) => {
          const label = labels[context.dataIndex];
          const cor = coresBase[label] || "#8B5CF6";

          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);

          gradient.addColorStop(0, cor);
          gradient.addColorStop(1, shadeColor(cor, -15));

          return gradient;
        },
        borderColor: "rgba(255,255,255,0.06)",
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#141236",
        borderColor: "#8B5CF6",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `R$ ${value.toFixed(2)}`;
          }
        }
      }
    },
    animation: {
      duration: 700,
      easing: "easeOutQuart"
    }
  };

  const handleClick = (event) => {
  const chart = chartRef.current;
  if (!chart) return;

  const elements = chart.getElementsAtEventForMode(
    event.nativeEvent,
    "nearest",
    { intersect: true },
    true
  );

  if (!elements.length) return;

  const index = elements[0].index;
  const label = String(chart.data.labels[index]).toLowerCase().trim();

  if (label.includes("reserva")) {
    onAbrirReservas?.();
  }
};

  if (!valores.length) return null;

  return (
    <div className="grafico-container">

  <div className="grafico-area">
    <Doughnut
      ref={chartRef}
      data={chartData}
      options={options}
      onClick={handleClick}
    />
  </div>

  <div className="grafico-legenda">
    {labels.map((label) => (
      <div key={label} className="legenda-item">
        <span
          className="legenda-cor"
          style={{ background: coresBase[label] }}
        />
        <span className="legenda-texto">{label}</span>
      </div>
    ))}
  </div>

</div>
  );
}

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;
  G = (G<255)?G:255;
  B = (B<255)?B:255;

  const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
  const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
  const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}