import { useState, useMemo } from "react";
import type { ChampionStats } from "../types/draft";
import { getWinrateColorClass } from "../theme";
import ChampionIcon from "./ChampionIcon";
import { ROLE_ICONS, ALL_ROLES_ICON } from "../constants";

interface ChampionGridProps {
  champions: ChampionStats[];
  selectedChampions: Set<string>;
  onSelect: (champion: string) => void;
  activeSlot: string | null;
}

export default function ChampionGrid({
  champions,
  selectedChampions,
  onSelect,
}: ChampionGridProps) {
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const roles = useMemo(() => ["top", "jng", "mid", "bot", "sup"], []);

  const filtered = useMemo(() => {
    return champions
      .filter((c) => {
        if (selectedChampions.has(c.name)) return false;
        if (filter && !c.name.toLowerCase().includes(filter.toLowerCase()))
          return false;
        if (roleFilter && c.role !== roleFilter) return false;
        return true;
      })
      .sort((a, b) => b.winrate - a.winrate);
  }, [champions, filter, roleFilter, selectedChampions]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-700 space-y-2">
        <input
          type="text"
          placeholder="Search champion..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setRoleFilter(null)}
            className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${
              !roleFilter
                ? "bg-blue-600 border-blue-500"
                : "bg-gray-800 border-gray-600 hover:border-gray-500"
            }`}
            title="All"
          >
            <img src={ALL_ROLES_ICON} alt="All" className="w-4 h-4" />
          </button>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r === roleFilter ? null : r)}
              className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${
                roleFilter === r
                  ? "bg-blue-600 border-blue-500"
                  : "bg-gray-800 border-gray-600 hover:border-gray-500"
              }`}
              title={r.toUpperCase()}
            >
              <img
                src={ROLE_ICONS[r as keyof typeof ROLE_ICONS]}
                alt={r.toUpperCase()}
                className="w-4 h-4"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-2">
          {filtered.map((c) => (
            <button
              key={`${c.name}-${c.role}`}
              onClick={() => onSelect(c.name)}
              className="flex flex-col items-center p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800 cursor-pointer transition-all"
            >
              <ChampionIcon name={c.name} size={40} className="mb-1" />
              <span className="text-xs font-medium text-gray-200 truncate w-full text-center">
                {c.name}
              </span>
              {!roleFilter && (
                <span className="text-[9px] text-blue-400 uppercase font-medium">
                  {c.role}
                </span>
              )}
              <span
                className={`text-[10px] font-mono ${getWinrateColorClass(c.winrate)}`}
              >
                {c.winrate.toFixed(1)}%
              </span>
              <span className="text-[9px] text-gray-500">{c.games}g</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-8">
              No champions found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
