import React, { Suspense, useEffect, useState } from "react";
import type {
  ChampionStats,
  CounterResult,
  SynergyResult,
  PatchEvolution,
  Filters,
} from "../types/draft";
import { api } from "../api/client";
import { ROLES } from "../constants";
import ChampionIcon from "./ChampionIcon";
import FilterControls from "./FilterControls";

const PatchEvolutionChart = React.lazy(() => import("./PatchEvolutionChart"));

interface ChampionDetailPanelProps {
  championName: string;
  initialRole?: string;
  filters?: Filters;
  leagues: string[];
  patches: string[];
  onClose: () => void;
  onShowMatches: () => void;
}

export default function ChampionDetailPanel({
  championName,
  initialRole,
  filters,
  leagues,
  patches,
  onClose,
  onShowMatches,
}: ChampionDetailPanelProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(() => ({
    league: filters?.league,
    patch: filters?.patch,
    date_from: filters?.date_from,
    date_to: filters?.date_to,
  }));
  const [roleStats, setRoleStats] = useState<ChampionStats[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole ?? "");
  const [counters, setCounters] = useState<CounterResult[]>([]);
  const [synergies, setSynergies] = useState<SynergyResult[]>([]);
  const [evolution, setEvolution] = useState<PatchEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(localFilters);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const f = localFilters;
    Promise.all([
      api.getChampion(championName, f, controller.signal),
      api.getChampionSynergies(championName, f, controller.signal),
      api.getChampionEvolution(championName, f, controller.signal),
    ])
      .then(([stats, syn, evo]) => {
        if (!controller.signal.aborted) {
          setRoleStats(stats);
          setSynergies(syn);
          setEvolution(evo);
          if (stats.length > 0) {
            setSelectedRole(initialRole ?? stats[0].role);
          }
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(String(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championName, filtersKey]);

  useEffect(() => {
    if (!selectedRole) return;
    const controller = new AbortController();
    const f = localFilters;
    api
      .getChampionCounters(championName, selectedRole, f, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCounters(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCounters([]);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championName, selectedRole, filtersKey]);

  const activeRole = roleStats.find((r) => r.role === selectedRole);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ChampionIcon name={championName} size={40} />
            <div>
              <h2 className="text-lg font-bold text-white">{championName}</h2>
              <p className="text-xs text-gray-400">
                {error
                  ? "Error loading data"
                  : activeRole
                    ? `${activeRole.games} games · ${activeRole.winrate}% WR · ${activeRole.pickrate}% pick`
                    : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onShowMatches}
              className="px-3 py-1.5 text-xs font-medium rounded bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
            >
              Match History
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none px-2"
            >
              &times;
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-12">{error}</p>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex gap-1 flex-wrap">
              {ROLES.map((r) => {
                const s = roleStats.find((x) => x.role === r);
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      selectedRole === r
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                    }`}
                  >
                    {r.toUpperCase()}
                    {s && (
                      <span className="ml-1.5 text-[10px] opacity-70">
                        {s.winrate}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <FilterControls
              filters={localFilters}
              onChange={setLocalFilters}
              leagues={leagues}
              patches={patches}
              size="sm"
            />

            {activeRole && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {activeRole.winrate}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Win Rate</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {activeRole.games}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Games</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {activeRole.pickrate}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Pick Rate</p>
                </div>
              </div>
            )}

            {evolution.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Win Rate by Patch
                </h3>
                <Suspense fallback={<div className="h-[220px] bg-gray-800/30 rounded-xl animate-pulse" />}>
                  <PatchEvolutionChart data={evolution} />
                </Suspense>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                  {evolution.map((e) => (
                    <span key={e.patch}>
                      {e.patch} ({e.games}g)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Best Against ({selectedRole.toUpperCase()})
                </h3>
                {counters.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No counter data for this role
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {[...counters].reverse().slice(0, 5).map((c) => (
                      <div
                        key={c.champion}
                        className="flex items-center gap-2 px-2 py-1.5 rounded bg-gray-800/50"
                      >
                        <ChampionIcon name={c.champion} size={24} />
                        <span className="text-white text-sm flex-1">
                          {c.champion}
                        </span>
                        <span className="text-xs text-gray-500">
                          {c.games}g
                        </span>
                        <span className="text-sm font-mono text-green-400">
                          {((1 - c.winrate_against) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Worst Against ({selectedRole.toUpperCase()})
                </h3>
                {counters.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No counter data for this role
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {counters.slice(0, 5).map((c) => (
                      <div
                        key={c.champion}
                        className="flex items-center gap-2 px-2 py-1.5 rounded bg-gray-800/50"
                      >
                        <ChampionIcon name={c.champion} size={24} />
                        <span className="text-white text-sm flex-1">
                          {c.champion}
                        </span>
                        <span className="text-xs text-gray-500">
                          {c.games}g
                        </span>
                        <span className="text-sm font-mono text-red-400">
                          {((1 - c.winrate_against) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Best Synergies
                </h3>
                {synergies.length === 0 ? (
                  <p className="text-gray-500 text-sm">No synergy data</p>
                ) : (
                  <div className="space-y-1.5">
                    {synergies.slice(0, 5).map((s) => (
                      <div
                        key={s.champion}
                        className="flex items-center gap-2 px-2 py-1.5 rounded bg-gray-800/50"
                      >
                        <ChampionIcon name={s.champion} size={24} />
                        <span className="text-white text-sm flex-1">
                          {s.champion}
                        </span>
                        <span className="text-xs text-gray-500">
                          {s.games}g
                        </span>
                        <span className="text-sm font-mono text-green-400">
                          {(s.winrate_together * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
