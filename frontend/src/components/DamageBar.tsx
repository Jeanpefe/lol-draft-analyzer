import { formatNumber } from "../utils/format";

export default function DamageBar({
  damage,
  teamDamage,
}: {
  damage: number;
  teamDamage: number;
}) {
  const pct = teamDamage > 0 ? (damage / teamDamage) * 100 : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="relative h-2.5 rounded-full overflow-hidden flex-1"
        style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: pct >= 25 ? "#f97316" : pct >= 20 ? "#eab308" : "#6b7280",
          }}
        />
      </div>
      <span className="text-[10px] text-gray-400 tabular-nums w-12 text-right shrink-0">
        {formatNumber(damage)}
      </span>
    </div>
  );
}
