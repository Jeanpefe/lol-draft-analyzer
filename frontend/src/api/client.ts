import type {
  ChampionStats,
  DraftState,
  DraftAnalysis,
  PickRecommendation,
  TeamDraftHistory,
  MatchDetail,
  Filters,
} from "../types/draft";

const API_BASE = "";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function buildQuery(params?: Filters): string {
  if (!params) return "";
  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== "",
  ) as [string, string][];
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}

export const api = {
  getChampions: (params?: Filters) =>
    fetchAPI<ChampionStats[]>(
      "/api/champions" + buildQuery(params),
    ),

  getChampion: (name: string) =>
    fetchAPI<ChampionStats[]>(`/api/champions/${encodeURIComponent(name)}`),

  getChampionCounters: (name: string, role: string) =>
    fetchAPI<{ champion: string; wr: number }[]>(
      `/api/champions/${encodeURIComponent(name)}/counters?role=${role}`,
    ),

  getChampionSynergies: (name: string) =>
    fetchAPI<{ champion: string; wr: number }[]>(
      `/api/champions/${encodeURIComponent(name)}/synergies`,
    ),

  analyzeDraft: (draft: DraftState) =>
    fetchAPI<DraftAnalysis>("/api/draft/analyze", {
      method: "POST",
      body: JSON.stringify(draft),
    }),

  recommendPicks: (draft: DraftState, slot: string) =>
    fetchAPI<PickRecommendation[]>(
      `/api/draft/recommend?slot=${slot}`,
      { method: "POST", body: JSON.stringify(draft) },
    ),

  getAvailableChampions: (draft: DraftState) =>
    fetchAPI<string[]>("/api/draft/available", {
      method: "POST",
      body: JSON.stringify(draft),
    }),

  getTeams: () => fetchAPI<string[]>("/api/teams"),

  getTeamDraft: (name: string) =>
    fetchAPI<TeamDraftHistory>(
      `/api/teams/${encodeURIComponent(name)}/draft`,
    ),

  getLeagues: () => fetchAPI<string[]>("/api/leagues"),

  getPatches: () => fetchAPI<string[]>("/api/patches"),

  getMatch: (gameid: string) =>
    fetchAPI<MatchDetail>(
      `/api/matches/${encodeURIComponent(gameid)}`,
    ),
};
