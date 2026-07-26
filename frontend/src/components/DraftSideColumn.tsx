import type { DraftState } from "../types/draft";
import { ROLES, ROLE_LABELS, ROLE_ICONS, type Side } from "../constants";
import { getSideStyles } from "../theme";
import WinRateGauge from "./WinRateGauge";
import ChampionIcon from "./ChampionIcon";

interface DraftSideColumnProps {
  side: Side;
  label: string;
  draft: DraftState;
  winrate?: number;
  confidence?: string;
  activeSlot: string | null;
  onSetActiveSlot: (slot: string | null) => void;
  onRemoveBan: (side: Side, index: number) => void;
}

export default function DraftSideColumn({
  side,
  label,
  draft,
  winrate,
  confidence,
  activeSlot,
  onSetActiveSlot,
  onRemoveBan,
}: DraftSideColumnProps) {
  const s = getSideStyles(side);
  const bans = side === "blue" ? draft.blue_bans : draft.red_bans;

  const handleSlotClick = (slot: string) => {
    if (activeSlot === slot) {
      onSetActiveSlot(null);
    } else {
      onSetActiveSlot(slot);
    }
  };

  return (
    <div className={`w-56 flex flex-col border rounded-xl overflow-hidden ${s.bg} shrink-0`}>
      <div className={`${s.header} px-3 py-2.5 flex items-center justify-between`}>
        <h3 className={`font-bold text-sm ${s.text}`}>{label}</h3>
        {winrate !== undefined && (
          <WinRateGauge
            winrate={winrate}
            confidence={confidence as "low" | "medium" | "high"}
            size="sm"
          />
        )}
      </div>

      <div className="p-3 space-y-3 flex-1">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Bans</p>
          <div className="flex flex-wrap gap-1">
            {bans.map((b, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-[11px] text-gray-300 cursor-pointer hover:bg-red-900/40 hover:border-red-600"
                onClick={() => onRemoveBan(side, i)}
                title="Click to remove"
              >
                {b}
              </span>
            ))}
            {bans.length < 5 && (
              <button
                onClick={() => onSetActiveSlot(`${side}_bans`)}
                className={`px-1.5 py-0.5 border border-dashed rounded text-[11px] transition-colors ${
                  activeSlot === `${side}_bans`
                    ? "border-yellow-500 text-yellow-400 bg-yellow-900/20"
                    : "border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                + Ban
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {ROLES.map((role) => {
            const slot = `${side}_${role}`;
            const champion = draft[slot as keyof DraftState] as string | null;
            const isActive = activeSlot === slot;

            return (
              <button
                key={role}
                onClick={() => {
                  if (champion) {
                    onSetActiveSlot(null);
                  } else {
                    handleSlotClick(slot);
                  }
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded border text-left text-sm transition-all ${
                  isActive
                    ? "border-yellow-500 bg-yellow-900/20 ring-1 ring-yellow-500/50"
                    : champion
                      ? "border-gray-600 bg-gray-800 text-white hover:border-gray-500"
                      : "border-dashed border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                }`}
              >
                <img
                  src={ROLE_ICONS[role]}
                  alt={role.toUpperCase()}
                  className="w-4 h-4 opacity-60 shrink-0"
                />
                {champion ? (
                  <>
                    <ChampionIcon name={champion} size={22} />
                    <span className="truncate font-medium text-xs">{champion}</span>
                  </>
                ) : (
                  <span className="text-xs">
                    {isActive ? "Select in grid..." : ROLE_LABELS[role]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
