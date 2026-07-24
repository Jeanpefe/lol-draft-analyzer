import { useEffect, useState } from "react";
import type { ChampionStats, Filters } from "../types/draft";
import { api } from "../api/client";
import FiltersBar from "../components/FiltersBar";
import ChampionTable from "../components/ChampionTable";

export default function MetaPage() {
  const [champions, setChampions] = useState<ChampionStats[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [patches, setPatches] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getLeagues(), api.getPatches()])
      .then(([l, p]) => {
        setLeagues(l);
        setPatches(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getChampions(filters)
      .then(setChampions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Meta Global</h1>

      <FiltersBar
        filters={filters}
        onChange={setFilters}
        leagues={leagues}
        patches={patches}
      />

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Champions
        </h2>
        {loading ? (
          <p className="text-gray-500 py-8 text-center">Loading...</p>
        ) : (
          <ChampionTable data={champions} />
        )}
      </div>
    </div>
  );
}
