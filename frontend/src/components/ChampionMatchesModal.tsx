import { useEffect, useState, useMemo } from "react";
import type { ChampionMatch, Filters } from "../types/draft";
import { api } from "../api/client";
import { ROLES } from "../constants";
import ChampionIcon from "../components/ChampionIcon";
import { StatRow, ObjectiveRow, SideTeam } from "../components/MatchView";

const PAGE_SIZE = 10;

interface ChampionMatchesModalProps {
  championName: string;
  role?: string;
  filters?: Filters;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChampionMatchesModal({
  championName,
  role,
  filters,
  onClose,
}: ChampionMatchesModalProps) {
  const [matches, setMatches] = useState<ChampionMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    api
      .getChampionMatches(championName, { ...filters, role })
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [championName, role, filters]);

  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const pageMatches = useMemo(
    () => matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [matches, page],
  );

  const wins = matches.filter((m) => {
    for (const side of ["blue", "red"] as const) {
      if (m[side].result === 1) {
        for (const r of ROLES) {
          if (m[side].roles[r]?.champion === championName) return true;
        }
      }
    }
    return false;
  }).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ChampionIcon name={championName} size={40} />
            <div>
              <h2 className="text-lg font-bold text-white">
                {championName} Match History
              </h2>
              <p className="text-xs text-gray-400">
                {matches.length} matches &middot; {wins}W {matches.length - wins}L
                {role && <> &middot; {role.toUpperCase()}</>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center py-12">Loading matches...</p>
          ) : matches.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No matches found.</p>
          ) : (
            pageMatches.map((match) => (
              <div
                key={match.gameid}
                className="border border-gray-800 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 text-[10px] text-gray-500">
                  <span>{match.league}</span>
                  <span>{match.date.split(" ")[0]}</span>
                  <span>{formatDuration(match.gamelength)}</span>
                  <span>Patch {match.patch}</span>
                </div>

                <div className="flex items-stretch p-3 gap-3">
                  <SideTeam side="blue" match={match} highlightChamp={championName} />

                  <div className="w-48 shrink-0 flex flex-col justify-center gap-1 bg-gray-800/30 rounded-lg px-3 py-2">
                    <StatRow label="Kills" blue={match.blue.teamkills} red={match.red.teamkills} />
                    <StatRow label="Deaths" blue={match.blue.teamdeaths} red={match.red.teamdeaths} higherIsBetter={false} />
                    <StatRow label="Gold" blue={match.blue.totalgold} red={match.red.totalgold} />
                    <StatRow label="Damage" blue={match.blue.damagetochampions} red={match.red.damagetochampions} />
                    <StatRow label="Vision" blue={match.blue.visionscore} red={match.red.visionscore} />
                    <div className="border-t border-gray-700 my-1" />
                    <ObjectiveRow label="Dragons" blue={match.blue.dragons} red={match.red.dragons} />
                    <ObjectiveRow label="Barons" blue={match.blue.barons} red={match.red.barons} />
                    <ObjectiveRow label="Towers" blue={match.blue.towers} red={match.red.towers} />
                    <ObjectiveRow label="Grubs" blue={match.blue.void_grubs} red={match.red.void_grubs} />
                    <ObjectiveRow label="Inhibs" blue={match.blue.inhibitors} red={match.red.inhibitors} />
                  </div>

                  <SideTeam side="red" match={match} highlightChamp={championName} />
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-gray-800">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs text-gray-400">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
