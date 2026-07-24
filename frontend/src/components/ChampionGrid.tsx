import { useState, useMemo } from "react";
import type { ChampionStats } from "../types/draft";
import ChampionCard from "./ChampionCard";

interface ChampionGridProps {
  champions: ChampionStats[];
  selectedChampions: Set<string>;
  onSelect: (champion: string) => void;
  onClose: () => void;
  defaultRole?: string;
}

export default function ChampionGrid({
  champions,
  selectedChampions,
  onSelect,
  onClose,
  defaultRole,
}: ChampionGridProps) {
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(defaultRole ?? null);

  const roles = useMemo(
    () => [...new Set(champions.map((c) => c.role))],
    [champions],
  );

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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search champion..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white flex-1 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex gap-1">
            <button
              onClick={() => setRoleFilter(null)}
              className={`px-2 py-1 rounded text-xs font-medium ${
                !roleFilter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r === roleFilter ? null : r)}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  roleFilter === r
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2">
          {filtered.map((c) => (
            <ChampionCard
              key={c.name}
              champion={c}
              onClick={() => onSelect(c.name)}
            />
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
