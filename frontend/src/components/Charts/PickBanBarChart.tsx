import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PickBanBarChartProps {
  data: { name: string; pickrate: number; banrate: number }[];
}

export default function PickBanBarChart({ data }: PickBanBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
          itemStyle={{ color: "#e5e7eb" }}
        />
        <Bar dataKey="pickrate" fill="#3b82f6" name="Pick Rate %" />
        <Bar dataKey="banrate" fill="#ef4444" name="Ban Rate %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
