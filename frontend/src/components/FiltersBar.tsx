import type { Filters } from "../types/draft";

interface FiltersBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  leagues: string[];
  patches: string[];
}

export default function FiltersBar({
  filters,
  onChange,
  leagues,
  patches,
}: FiltersBarProps) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">League:</span>
        <select
          value={filters.league ?? ""}
          onChange={(e) => update("league", e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All</option>
          {leagues.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Patch:</span>
        <select
          value={filters.patch ?? ""}
          onChange={(e) => update("patch", e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All</option>
          {patches.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">From:</span>
        <input
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) => update("date_from", e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">To:</span>
        <input
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) => update("date_to", e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </label>
    </div>
  );
}
