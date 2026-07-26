import React from "react";
import { getWinrateColorClass, getWinrateColorHex } from "../theme";

interface WinRateGaugeProps {
  winrate: number;
  confidence?: "low" | "medium" | "high";
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, string> = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-red-400",
};

const sizeMap = { sm: 48, md: 72, lg: 96 };
const strokeMap = { sm: 4, md: 5, lg: 6 };

export default React.memo(function WinRateGauge({
  winrate,
  confidence,
  size = "md",
}: WinRateGaugeProps) {
  const r = sizeMap[size] / 2 - strokeMap[size];
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - winrate / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: sizeMap[size], height: sizeMap[size] }}>
        <svg
          width={sizeMap[size]}
          height={sizeMap[size]}
          className="-rotate-90"
        >
          <circle
            cx={sizeMap[size] / 2}
            cy={sizeMap[size] / 2}
            r={r}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeMap[size]}
          />
          <circle
            cx={sizeMap[size] / 2}
            cy={sizeMap[size] / 2}
            r={r}
            fill="none"
            stroke={getWinrateColorHex(winrate)}
            strokeWidth={strokeMap[size]}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getWinrateColorClass(winrate)}`}>
            {winrate.toFixed(1)}%
          </span>
        </div>
      </div>
      {confidence && (
        <span
          className={`text-[10px] uppercase font-semibold tracking-wider ${colorMap[confidence]}`}
        >
          {confidence}
        </span>
      )}
    </div>
  );
});
