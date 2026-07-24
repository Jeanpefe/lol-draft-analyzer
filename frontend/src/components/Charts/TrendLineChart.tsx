import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendLineChartProps {
  data: { patch: string; winrate: number; pickrate: number }[];
}

export default function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <XAxis dataKey="patch" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="winrate"
          stroke="#3b82f6"
          name="Win Rate %"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="pickrate"
          stroke="#a855f7"
          name="Pick Rate %"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
