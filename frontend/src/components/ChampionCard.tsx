import type { ChampionStats } from "../types/draft";
import { getWinrateColorClass } from "../theme";
import ChampionIcon from "./ChampionIcon";

interface ChampionCardProps {
  champion: ChampionStats;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function ChampionCard({
  champion,
  selected,
  disabled,
  onClick,
}: ChampionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center p-2 rounded-lg border transition-all
        ${selected ? "border-blue-500 bg-blue-900/30 ring-1 ring-blue-500" : "border-gray-700 bg-gray-800/50"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "hover:border-gray-500 hover:bg-gray-800 cursor-pointer"}
      `}
    >
      <ChampionIcon name={champion.name} size={40} className="mb-1" />
      <span className="text-xs font-medium text-gray-200 truncate w-full text-center">
        {champion.name}
      </span>
      <span
        className={`text-[10px] font-mono ${getWinrateColorClass(champion.winrate)}`}
      >
        {champion.winrate.toFixed(1)}%
      </span>
      <span className="text-[9px] text-gray-500">
        {champion.games}g
      </span>
    </button>
  );
}
