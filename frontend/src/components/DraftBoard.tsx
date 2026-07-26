import type { DraftState, ChampionStats } from "../types/draft";
import DraftSideColumn from "./DraftSideColumn";
import ChampionGrid from "./ChampionGrid";

interface DraftBoardProps {
  draft: DraftState;
  analysis: { blue_winrate: number; red_winrate: number; blue_confidence: string; red_confidence: string } | null;
  availableChampions: ChampionStats[];
  selectedChampions: Set<string>;
  activeSlot: string | null;
  onSetActiveSlot: (slot: string | null) => void;
  onPick: (slot: string, champion: string) => void;
  onBan: (side: "blue" | "red", champion: string) => void;
  onRemoveBan: (side: "blue" | "red", index: number) => void;
}

export default function DraftBoard({
  draft,
  analysis,
  availableChampions,
  selectedChampions,
  activeSlot,
  onSetActiveSlot,
  onPick,
  onBan,
  onRemoveBan,
}: DraftBoardProps) {
  const handleSelect = (champion: string) => {
    if (!activeSlot) return;

    if (activeSlot.endsWith("_bans")) {
      const side = activeSlot.startsWith("blue") ? "blue" as const : "red" as const;
      onBan(side, champion);
    } else {
      onPick(activeSlot, champion);
      onSetActiveSlot(null);
    }
  };

  return (
    <div className="flex gap-4 min-h-[520px]">
      <DraftSideColumn
        side="blue"
        label="Ally"
        draft={draft}
        winrate={analysis?.blue_winrate}
        confidence={analysis?.blue_confidence}
        activeSlot={activeSlot}
        onSetActiveSlot={onSetActiveSlot}
        onRemoveBan={onRemoveBan}
      />

      <div className="flex-1 min-w-0">
        <ChampionGrid
          champions={availableChampions}
          selectedChampions={selectedChampions}
          onSelect={handleSelect}
          activeSlot={activeSlot}
        />
      </div>

      <DraftSideColumn
        side="red"
        label="Opponent"
        draft={draft}
        winrate={analysis?.red_winrate}
        confidence={analysis?.red_confidence}
        activeSlot={activeSlot}
        onSetActiveSlot={onSetActiveSlot}
        onRemoveBan={onRemoveBan}
      />
    </div>
  );
}
