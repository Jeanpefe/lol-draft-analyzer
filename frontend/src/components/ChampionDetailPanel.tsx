import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type {
  ChampionStats,
  CounterResult,
  SynergyResult,
  PatchEvolution,
} from "../types/draft";
import { api } from "../api/client";
import { ROLES } from "../constants";
import ChampionIcon from "./ChampionIcon";

interface ChampionDetailPanelProps {
  championName: string;
  initialRole?: string;
  onClose: () => void;
  onShowMatches: () => void;
}

export default function ChampionDetailPanel({
  championName,
  initialRole,
  onClose,
  onShowMatches,
}: ChampionDetailPanelProps) {
  const [roleStats, setRoleStats] = useState<ChampionStats[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole ?? "");
  const [counters, setCounters] = useState<CounterResult[]>([]);
  const [synergies, setSynergies] = useState<SynergyResult[]>([]);
  const [evolution, setEvolution] = useState<PatchEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getChampion(championName),
      api.getChampionSynergies(championName),
      api.getChampionEvolution(championName),
    ])
      .then(([stats, syn, evo]) => {
        setRoleStats(stats);
        setSynergies(syn);
        setEvolution(evo);
        if (stats.length > 0) {
          setSelectedRole(initialRole ?? stats[0].role);
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championName]);

  useEffect(() => {
    if (!selectedRole) return;
    api
      .getChampionCounters(championName, selectedRole)
      .then(setCounters)
      .catch(() => setCounters([]));
  }, [championName, selectedRole]);

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
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={evolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="patch"
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      stroke="#4B5563"
                    />
                    <YAxis
                      domain={[30, 70]}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      stroke="#4B5563"
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [
                        `${value}%`,
                        "Win Rate",
                      ]}
                    />
                    <ReferenceLine
                      y={50}
                      stroke="#6B7280"
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="winrate"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                  {evolution.map((e) => (
                    <span key={e.patch}>
                      {e.patch} ({e.games}g)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Counters ({selectedRole.toUpperCase()})
                </h3>
                {counters.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No counter data for this role
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {counters.slice(0, 8).map((c) => (
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
                          {(c.winrate_against * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Synergies
                </h3>
                {synergies.length === 0 ? (
                  <p className="text-gray-500 text-sm">No synergy data</p>
                ) : (
                  <div className="space-y-1.5">
                    {synergies.slice(0, 8).map((s) => (
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
