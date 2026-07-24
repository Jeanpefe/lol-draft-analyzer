import type { Factor } from "../types/draft";

interface FactorsListProps {
  factors: Factor[];
}

export default function FactorsList({ factors }: FactorsListProps) {
  if (factors.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">
        No factors to display yet.
      </p>
    );
  }

  const sorted = [...factors].sort((a, b) => b.impact - a.impact);

  return (
    <div className="space-y-1.5">
      {sorted.map((f, i) => (
        <div
          key={`${f.name}-${i}`}
          className="flex items-start gap-2 text-sm"
        >
          <span
            className={`font-mono font-bold shrink-0 w-16 text-right ${
              f.impact > 0
                ? "text-green-400"
                : f.impact < 0
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {f.impact > 0 ? "+" : ""}
            {f.impact.toFixed(1)}%
          </span>
          <span className="text-gray-300">
            <span className="font-medium text-gray-200">{f.name}:</span>{" "}
            {f.description}
            {f.games != null && f.games > 0 && (
              <span className="text-gray-500 ml-1">({f.games}g)</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
