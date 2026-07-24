import type { DraftState, ChampionStats } from "../types/draft";
import DraftSideColumn from "./DraftSideColumn";

interface DraftBoardProps {
  draft: DraftState;
  analysis: { blue_winrate: number; red_winrate: number; blue_confidence: string; red_confidence: string } | null;
  availableChampions: ChampionStats[];
  selectedChampions: Set<string>;
  onPick: (slot: string, champion: string) => void;
  onBan: (side: "blue" | "red", champion: string) => void;
  onRemoveBan: (side: "blue" | "red", index: number) => void;
}

export default function DraftBoard({
  draft,
  analysis,
  availableChampions,
  selectedChampions,
  onPick,
  onBan,
  onRemoveBan,
}: DraftBoardProps) {
  return (
    <div className="flex gap-4">
      <DraftSideColumn
        side="blue"
        label="Blue"
        draft={draft}
        winrate={analysis?.blue_winrate}
        confidence={analysis?.blue_confidence}
        onPick={onPick}
        onBan={onBan}
        onRemoveBan={onRemoveBan}
        availableChampions={availableChampions}
        selectedChampions={selectedChampions}
      />
      <DraftSideColumn
        side="red"
        label="Red"
        draft={draft}
        winrate={analysis?.red_winrate}
        confidence={analysis?.red_confidence}
        onPick={onPick}
        onBan={onBan}
        onRemoveBan={onRemoveBan}
        availableChampions={availableChampions}
        selectedChampions={selectedChampions}
      />
    </div>
  );
}
