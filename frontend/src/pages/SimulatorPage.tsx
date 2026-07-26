import { useEffect, useState, useMemo } from "react";
import type { ChampionStats, DraftState, Filters } from "../types/draft";
import { useDraftState } from "../hooks/useDraftState";
import { api } from "../api/client";
import { ROLES, VALID_SLOTS } from "../constants";
import { getSideStyles } from "../theme";
import DraftBoard from "../components/DraftBoard";
import FactorsList from "../components/FactorsList";
import FiltersBar from "../components/FiltersBar";

export default function SimulatorPage() {
  const {
    draft,
    analysis,
    recommendations,
    setPick,
    setBan,
    removeBan,
    reset,
    getRecommendations,
  } = useDraftState();

  const [champions, setChampions] = useState<ChampionStats[]>([]);
  const [activeRecSlot, setActiveRecSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [leagues, setLeagues] = useState<string[]>([]);
  const [patches, setPatches] = useState<string[]>([]);
  const [availableNames, setAvailableNames] = useState<string[] | null>(null);

  useEffect(() => {
    Promise.all([api.getLeagues(), api.getPatches()])
      .then(([l, p]) => {
        setLeagues(l);
        setPatches(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.getChampions(filters).then(setChampions).catch((e) => setError(String(e)));
  }, [filters]);

  useEffect(() => {
    api
      .getAvailableChampions(draft)
      .then(setAvailableNames)
      .catch(() => setAvailableNames(null));
  }, [draft]);

  const selectedChampions = useMemo(() => {
    if (availableNames) {
      const available = new Set(availableNames);
      return new Set(
        champions
          .map((c) => c.name)
          .filter((name) => !available.has(name)),
      );
    }
    const banned = new Set([...draft.blue_bans, ...draft.red_bans]);
    const picked = new Set<string>(
      ROLES.flatMap((r) => [
        draft[`blue_${r}` as keyof DraftState],
        draft[`red_${r}` as keyof DraftState],
      ]).filter((x): x is string => typeof x === "string"),
    );
    return new Set([...banned, ...picked]);
  }, [draft, availableNames, champions]);

  const handleRecRequest = (slot: string) => {
    setActiveRecSlot(slot);
    getRecommendations(slot);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Simulador de Draft</h1>
        <button
          onClick={reset}
          className="px-4 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
        >
          Reset Draft
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <FiltersBar
        filters={filters}
        onChange={setFilters}
        leagues={leagues}
        patches={patches}
      />

      {champions.length === 0 && !error ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500">Loading champions...</p>
        </div>
      ) : (
        <DraftBoard
          draft={draft}
          analysis={analysis}
          availableChampions={champions}
          selectedChampions={selectedChampions}
          onPick={(slot, champ) => setPick(slot, champ)}
          onBan={setBan}
          onRemoveBan={removeBan}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pick Recommendations
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {VALID_SLOTS.map((slot) => {
              const side = slot.startsWith("blue") ? "blue" as const : "red" as const;
              const role = slot.split("_")[1];
              const s = getSideStyles(side);
              return (
                <button
                  key={slot}
                  onClick={() => handleRecRequest(slot)}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                    activeRecSlot === slot
                      ? `${s.header} ${s.border} ${s.text}`
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                  }`}
                >
                  {side.toUpperCase()} {role.toUpperCase()}
                </button>
              );
            })}
          </div>
          {recommendations.length > 0 && (
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div
                  key={rec.champion}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <span className="text-gray-500 text-sm font-bold w-5">
                    {i + 1}.
                  </span>
                  <span className="text-white font-medium flex-1">
                    {rec.champion}
                  </span>
                  <span
                    className={`text-sm font-mono ${
                      rec.predicted_winrate >= 50
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {rec.predicted_winrate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    ({rec.confidence})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Factor Breakdown
          </h2>
          <FactorsList factors={analysis?.factors ?? []} />
        </div>
      </div>
    </div>
  );
}
