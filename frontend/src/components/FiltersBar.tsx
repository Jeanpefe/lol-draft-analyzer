import type { Filters } from "../types/draft";
import { ROLES, ROLE_ICONS, ALL_ROLES_ICON } from "../constants";

interface FiltersBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  leagues: string[];
  patches: string[];
  hideRoleFilter?: boolean;
}

export default function FiltersBar({
  filters,
  onChange,
  leagues,
  patches,
  hideRoleFilter,
}: FiltersBarProps) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="space-y-3">
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
      {!hideRoleFilter && (
        <div className="flex flex-wrap gap-2 items-center">
        <span className="text-gray-400 text-sm">Position:</span>
        <button
          onClick={() => update("role", "")}
          className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
            !filters.role
              ? "bg-blue-600 border-blue-500"
              : "bg-gray-800 border-gray-600 hover:border-gray-500"
          }`}
          title="All positions"
        >
          <img src={ALL_ROLES_ICON} alt="All" className="w-5 h-5" />
        </button>
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => update("role", filters.role === r ? "" : r)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
              filters.role === r
                ? "bg-blue-600 border-blue-500"
                : "bg-gray-800 border-gray-600 hover:border-gray-500"
            }`}
            title={r.toUpperCase()}
          >
            <img src={ROLE_ICONS[r]} alt={r.toUpperCase()} className="w-5 h-5" />
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
