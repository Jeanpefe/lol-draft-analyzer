import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PatchEvolution } from "../types/draft";

interface PatchEvolutionChartProps {
  data: PatchEvolution[];
}

export default function PatchEvolutionChart({ data }: PatchEvolutionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="patch"
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          stroke="#4B5563"
        />
        <YAxis
          domain={[30, 70]}
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          stroke="#4B5563"
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#F3F4F6",
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value}%`, "Win Rate"]}
        />
        <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="winrate"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: "#3B82F6", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
