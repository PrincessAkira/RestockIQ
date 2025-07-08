import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function SalesTrendChart({ data }) {
  const chartData = {
    labels: data?.map((entry) => entry.label), // e.g., ["Mon", "Tue", ...]
    datasets: [
      {
        label: "Sales",
        data: data?.map((entry) => entry.sales),
        fill: false,
        borderColor: "#6a1b9a",
        backgroundColor: "#6a1b9a",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  return <Line data={chartData} options={options} />;
}
