import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface WinRatePieChartProps {
  blueWinrate: number;
  redWinrate: number;
}

export default function WinRatePieChart({
  blueWinrate,
  redWinrate,
}: WinRatePieChartProps) {
  const data = [
    { name: "Blue", value: blueWinrate },
    { name: "Red", value: redWinrate },
  ];
  const COLORS = ["#3b82f6", "#ef4444"];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
