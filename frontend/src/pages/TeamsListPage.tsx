import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAsyncData } from "../hooks/useAsyncData";

export default function TeamsListPage() {
  const { data: teams, loading } = useAsyncData<string[]>(
    (signal) => api.getTeams(signal),
    [],
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!teams) return [];
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter((t) => t.toLowerCase().includes(q));
  }, [teams, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Equipos</h1>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white w-full max-w-sm focus:outline-none focus:border-blue-500"
        />
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
                key={team}
                to={`/team/${encodeURIComponent(team)}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm"
              >
                <span className="text-white font-medium flex-1">{team}</span>
                <span className="text-gray-500 text-xs">&rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
