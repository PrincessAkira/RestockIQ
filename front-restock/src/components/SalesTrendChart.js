// src/components/SalesTrendChart.js

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts';

/**
 * Renders a simple line chart of sales over time.
 * @param {{ date: string, sales: number }[]} data
 */
export default function SalesTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke="#4F46E5" />
      </LineChart>
    </ResponsiveContainer>
  );
}
