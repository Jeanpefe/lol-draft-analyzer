import { useState } from "react";
import type { DraftState, ChampionStats } from "../types/draft";
import ChampionGrid from "./ChampionGrid";
import WinRateGauge from "./WinRateGauge";
import ChampionIcon from "./ChampionIcon";

interface DraftBoardProps {
  draft: DraftState;
  analysis: { blue_winrate: number; red_winrate: number; blue_confidence: string; red_confidence: string } | null;
  availableChampions: ChampionStats[];
  selectedChampions: Set<string>;
  onPick: (slot: string, champion: string) => void;
  onBan: (side: "blue" | "red", champion: string) => void;
  onRemoveBan: (side: "blue" | "red", index: number) => void;
}

const ROLES = ["top", "jng", "mid", "bot", "sup"] as const;
const ROLE_LABELS: Record<string, string> = {
  top: "TOP",
  jng: "JNG",
  mid: "MID",
  bot: "BOT",
  sup: "SUP",
};

export default function DraftBoard({
  draft,
  analysis,
  availableChampions,
  selectedChampions,
  onPick,
  onBan,
  onRemoveBan,
}: DraftBoardProps) {
  const [gridOpen, setGridOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const openGrid = (slot: string) => {
    setActiveSlot(slot);
    setGridOpen(true);
  };

  const handleSelect = (champion: string) => {
    if (activeSlot) {
      if (activeSlot.endsWith("_bans")) {
        const side = activeSlot.startsWith("blue") ? "blue" : "red";
        onBan(side, champion);
      } else {
        onPick(activeSlot, champion);
      }
    }
    setGridOpen(false);
    setActiveSlot(null);
  };

  const renderSide = (
    side: "blue" | "red",
    label: string,
    winrate: number | undefined,
    confidence: string | undefined,
  ) => {
    const bans = side === "blue" ? draft.blue_bans : draft.red_bans;
    const bgColor = side === "blue" ? "bg-blue-900/20 border-blue-800" : "bg-red-900/20 border-red-800";
    const headerBg = side === "blue" ? "bg-blue-900/40" : "bg-red-900/40";
    const accentText = side === "blue" ? "text-blue-400" : "text-red-400";

    return (
      <div className={`flex-1 border rounded-xl overflow-hidden ${bgColor}`}>
        <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
          <h3 className={`font-bold text-lg ${accentText}`}>{label} Side</h3>
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
    );
  };

  return (
    <>
      <div className="flex gap-4">
        {renderSide(
          "blue",
          "Blue",
          analysis?.blue_winrate,
          analysis?.blue_confidence,
        )}
        {renderSide(
          "red",
          "Red",
          analysis?.red_winrate,
          analysis?.red_confidence,
        )}
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
        />
      )}
    </>
  );
}
