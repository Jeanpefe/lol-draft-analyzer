import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAsyncData } from "../hooks/useAsyncData";
import type { TeamInfo } from "../types/draft";

export default function TeamsListPage() {
  const { data: teams, loading } = useAsyncData<TeamInfo[]>(
    (signal) => api.getTeams(undefined, signal),
    [],
  );
  const { data: leagues } = useAsyncData<string[]>(
    (signal) => api.getLeagues(signal),
    [],
  );

  const [search, setSearch] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("");

  const filtered = useMemo(() => {
    if (!teams) return [];
    let result = teams;
    if (selectedLeague) {
      result = result.filter((t) => t.leagues.includes(selectedLeague));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }
    return result;
  }, [teams, search, selectedLeague]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Equipos</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white w-full max-w-sm focus:outline-none focus:border-blue-500"
        />
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las ligas</option>
          {leagues?.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">
          {filtered.length} equipos
        </span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        {loading ? (
          <p className="text-gray-500 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No teams found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtered.map((team) => (
              <Link
                key={team.name}
                to={`/team/${encodeURIComponent(team.name)}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm"
              >
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-8 h-8 rounded object-contain bg-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-bold">
                    {team.name.charAt(0)}
                  </div>
                )}
                <span className="text-white font-medium flex-1">
                  {team.name}
                </span>
                <span className="text-gray-500 text-xs">
                  {team.leagues.join(", ")}
                </span>
                <span className="text-gray-500 text-xs">&rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
