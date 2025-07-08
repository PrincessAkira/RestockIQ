import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

// 📈 SalesOverTimeChart displays sales trends using a line chart
// Props:
// - data: Array of objects with 'date' and 'sales' keys
export function SalesOverTimeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#f5f5f5', borderColor: '#ccc' }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#6A1B9A"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ✅ Ensure your charts/index.js uses named exports like this:
// export { SalesOverTimeChart } from "./SalesOverTimeChart";
// ✅ And not default exports unless you change the import style.

