import type { Filters } from "../types/draft";
import { ROLES, ROLE_ICONS, ALL_ROLES_ICON } from "../constants";
import FilterControls from "./FilterControls";

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
  return (
    <div className="space-y-3">
      <FilterControls
        filters={filters}
        onChange={onChange}
        leagues={leagues}
        patches={patches}
      />
      {!hideRoleFilter && (
        <div className="flex flex-wrap gap-2 items-center">
        <span className="text-gray-400 text-sm">Position:</span>
        <button
          onClick={() => onChange({ ...filters, role: "" })}
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
            onClick={() => onChange({ ...filters, role: filters.role === r ? "" : r })}
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
