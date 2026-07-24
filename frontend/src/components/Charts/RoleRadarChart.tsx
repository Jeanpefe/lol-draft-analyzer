import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RoleRadarChartProps {
  data: { role: string; value: number }[];
}

export default function RoleRadarChart({ data }: RoleRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="role" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Radar
          name="Win Rate"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
