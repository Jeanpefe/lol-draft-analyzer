import { useState } from "react";
import type { DraftState, ChampionStats } from "../types/draft";
import { ROLES, ROLE_LABELS, type Side } from "../constants";
import { getSideStyles } from "../theme";
import ChampionGrid from "./ChampionGrid";
import WinRateGauge from "./WinRateGauge";
import ChampionIcon from "./ChampionIcon";

interface DraftSideColumnProps {
  side: Side;
  label: string;
  draft: DraftState;
  winrate?: number;
  confidence?: string;
  onPick: (slot: string, champion: string) => void;
  onBan: (side: Side, champion: string) => void;
  onRemoveBan: (side: Side, index: number) => void;
  availableChampions: ChampionStats[];
  selectedChampions: Set<string>;
}

export default function DraftSideColumn({
  side,
  label,
  draft,
  winrate,
  confidence,
  onPick,
  onBan,
  onRemoveBan,
  availableChampions,
  selectedChampions,
}: DraftSideColumnProps) {
  const [gridOpen, setGridOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const s = getSideStyles(side);
  const bans = side === "blue" ? draft.blue_bans : draft.red_bans;

  const openGrid = (slot: string) => {
    setActiveSlot(slot);
    setGridOpen(true);
  };

  const handleSelect = (champion: string) => {
    if (activeSlot) {
      if (activeSlot.endsWith("_bans")) {
        onBan(side, champion);
      } else {
        onPick(activeSlot, champion);
      }
    }
    setGridOpen(false);
    setActiveSlot(null);
  };

  return (
    <>
      <div className={`flex-1 border rounded-xl overflow-hidden ${s.bg}`}>
        <div className={`${s.header} px-4 py-3 flex items-center justify-between`}>
          <h3 className={`font-bold text-lg ${s.text}`}>{label} Side</h3>
          {winrate !== undefined && (
            <WinRateGauge
              winrate={winrate}
              confidence={confidence as "low" | "medium" | "high"}
              size="sm"
            />
          )}
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Bans</p>
            <div className="flex flex-wrap gap-1.5">
              {bans.map((b, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300 cursor-pointer hover:bg-red-900/40 hover:border-red-600"
                  onClick={() => onRemoveBan(side, i)}
                  title="Click to remove"
                >
                  {b}
                </span>
              ))}
              {bans.length < 5 && (
                <button
                  onClick={() => openGrid(`${side}_bans`)}
                  className="px-2 py-0.5 border border-dashed border-gray-600 rounded text-xs text-gray-500 hover:text-gray-300 hover:border-gray-400"
                >
                  + Ban
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {ROLES.map((role) => {
              const slot = `${side}_${role}`;
              const champion = draft[slot as keyof DraftState] as string | null;
              return (
                <div key={role} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-8">
                    {ROLE_LABELS[role]}
                  </span>
                  <button
                    onClick={() => {
                      if (champion) {
                        onPick(slot, null as unknown as string);
                      } else {
                        openGrid(slot);
                      }
                    }}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded border text-sm text-left transition-colors ${
                      champion
                        ? "border-gray-600 bg-gray-800 text-white hover:border-gray-500"
                        : "border-dashed border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {champion ? (
                      <>
                        <ChampionIcon name={champion} size={24} />
                        {champion}
                      </>
                    ) : (
                      "Click to pick..."
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {gridOpen && (
        <ChampionGrid
          champions={availableChampions}
          selectedChampions={selectedChampions}
          onSelect={handleSelect}
          onClose={() => {
            setGridOpen(false);
            setActiveSlot(null);
          }}
          defaultRole={activeSlot?.includes("_bans") ? undefined : activeSlot?.split("_")[1]}
        />
      )}
    </>
  );
}
