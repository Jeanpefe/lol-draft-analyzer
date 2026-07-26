import type { Filters } from "../types/draft";

interface FilterControlsProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  leagues: string[];
  patches: string[];
  size?: "sm" | "md";
}

export default function FilterControls({
  filters,
  onChange,
  leagues,
  patches,
  size = "md",
}: FilterControlsProps) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const selectCls =
    size === "sm"
      ? "bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
      : "bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500";

  const inputCls =
    size === "sm"
      ? "bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
      : "bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500";

  const labelCls = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className={`flex items-center gap-1.5 ${labelCls}`}>
        <span className="text-gray-500">League:</span>
        <select
          value={filters.league ?? ""}
          onChange={(e) => update("league", e.target.value)}
          className={selectCls}
        >
          <option value="">All</option>
          {leagues.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className={`flex items-center gap-1.5 ${labelCls}`}>
        <span className="text-gray-500">Patch:</span>
        <select
          value={filters.patch ?? ""}
          onChange={(e) => update("patch", e.target.value)}
          className={selectCls}
        >
          <option value="">All</option>
          {patches.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className={`flex items-center gap-1.5 ${labelCls}`}>
        <span className="text-gray-500">From:</span>
        <input
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) => update("date_from", e.target.value)}
          className={inputCls}
        />
      </label>
      <label className={`flex items-center gap-1.5 ${labelCls}`}>
        <span className="text-gray-500">To:</span>
        <input
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) => update("date_to", e.target.value)}
          className={inputCls}
        />
      </label>
    </div>
  );
}
