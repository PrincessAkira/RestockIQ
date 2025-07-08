import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StockOverviewChart({ data }) {
  const chartData = {
    labels: data?.map((item) => item.product), // e.g., ["Milk", "Bread"]
    datasets: [
      {
        label: "Stock Level",
        data: data?.map((item) => item.stock),
        backgroundColor: "#8e24aa",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={chartData} options={options} />;
}
