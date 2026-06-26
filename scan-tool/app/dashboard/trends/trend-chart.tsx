"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface TrendPoint {
  date: string;
  overall: number;
  ai: number;
  site: number;
  comp: number;
}

const SERIES: { key: keyof Omit<TrendPoint, "date">; label: string; color: string }[] = [
  { key: "overall", label: "Overall", color: "#0f1729" },
  { key: "ai", label: "AI Visibility", color: "#2F5FE0" },
  { key: "site", label: "Site Health", color: "#16a34a" },
  { key: "comp", label: "Competitive", color: "#d97706" },
];

export function TrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
