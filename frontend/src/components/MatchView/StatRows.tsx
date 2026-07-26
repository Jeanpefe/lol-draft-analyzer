import { formatNumber } from "../../utils/format";

export function StatRow({
  label,
  blue,
  red,
  higherIsBetter = true,
}: {
  label: string;
  blue: number;
  red: number;
  higherIsBetter?: boolean;
}) {
  const blueWins = higherIsBetter ? blue > red : blue < red;
  const redWins = higherIsBetter ? red > blue : red < blue;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className={`w-16 text-right tabular-nums ${blueWins ? "text-green-400 font-medium" : "text-gray-400"}`}>
        {formatNumber(blue)}
      </span>
      <span className="text-gray-600 w-14 text-center shrink-0">{label}</span>
      <span className={`w-16 text-left tabular-nums ${redWins ? "text-green-400 font-medium" : "text-gray-400"}`}>
        {formatNumber(red)}
      </span>
    </div>
  );
}

export function ObjectiveRow({
  label,
  blue,
  red,
}: {
  label: string;
  blue: number;
  red: number;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className={`w-16 text-right tabular-nums ${blue > red ? "text-green-400 font-medium" : "text-gray-400"}`}>
        {blue}
      </span>
      <span className="text-gray-600 w-14 text-center shrink-0">{label}</span>
      <span className={`w-16 text-left tabular-nums ${red > blue ? "text-green-400 font-medium" : "text-gray-400"}`}>
        {red}
      </span>
    </div>
  );
}
