import { useState } from "react";
import type { ChampionStats, Filters } from "../types/draft";
import { api } from "../api/client";
import { useAsyncData } from "../hooks/useAsyncData";
import FiltersBar from "../components/FiltersBar";
import ChampionTable from "../components/ChampionTable";
import ChampionDetailPanel from "../components/ChampionDetailPanel";
import ChampionMatchesModal from "../components/ChampionMatchesModal";

export default function MetaPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [selectedChampion, setSelectedChampion] = useState<{
    name: string;
    role: string;
  } | null>(null);
  const [showMatches, setShowMatches] = useState(false);

  const { data: leagues } = useAsyncData<string[]>(
    (signal) => api.getLeagues(signal),
    [],
  );
  const { data: patches } = useAsyncData<string[]>(
    (signal) => api.getPatches(signal),
    [],
  );

  const { data: champions, loading } = useAsyncData<ChampionStats[]>(
    (signal) => api.getChampions(filters, signal),
    [filters],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Meta Global</h1>

      <FiltersBar
        filters={filters}
        onChange={setFilters}
        leagues={leagues ?? []}
        patches={patches ?? []}
      />

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Champions
        </h2>
        {loading ? (
          <p className="text-gray-500 py-8 text-center">Loading...</p>
        ) : (
          <ChampionTable
            data={champions ?? []}
            onChampionClick={(name, role) => {
              setSelectedChampion({ name, role });
              setShowMatches(false);
            }}
          />
        )}
      </div>

      {selectedChampion && !showMatches && (
        <ChampionDetailPanel
          championName={selectedChampion.name}
          initialRole={selectedChampion.role}
          onClose={() => setSelectedChampion(null)}
          onShowMatches={() => setShowMatches(true)}
        />
      )}

      {selectedChampion && showMatches && (
        <ChampionMatchesModal
          championName={selectedChampion.name}
          role={selectedChampion.role}
          filters={filters}
          onClose={() => {
            setShowMatches(false);
            setSelectedChampion(null);
          }}
        />
      )}
    </div>
  );
}
