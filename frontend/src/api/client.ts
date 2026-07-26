import type {
  ChampionStats,
  ChampionMatch,
  DraftState,
  DraftAnalysis,
  PickRecommendation,
  TeamDraftHistory,
  MatchDetail,
  Filters,
  CounterResult,
  SynergyResult,
  PatchEvolution,
} from "../types/draft";

const API_BASE = "";

async function fetchAPI<T>(
  path: string,
  options?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function buildQuery(params?: object): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  ) as [string, string][];
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}

export const api = {
  getChampions: (params?: Filters, signal?: AbortSignal) =>
    fetchAPI<ChampionStats[]>(
      "/api/champions" + buildQuery(params),
      { signal },
    ),

  getChampion: (name: string, signal?: AbortSignal) =>
    fetchAPI<ChampionStats[]>(`/api/champions/${encodeURIComponent(name)}`, { signal }),

  getChampionCounters: (name: string, role: string, signal?: AbortSignal) =>
    fetchAPI<CounterResult[]>(
      `/api/champions/${encodeURIComponent(name)}/counters?role=${role}`,
      { signal },
    ),

  getChampionSynergies: (name: string, signal?: AbortSignal) =>
    fetchAPI<SynergyResult[]>(
      `/api/champions/${encodeURIComponent(name)}/synergies`,
      { signal },
    ),

  getChampionEvolution: (name: string, signal?: AbortSignal) =>
    fetchAPI<PatchEvolution[]>(
      `/api/champions/${encodeURIComponent(name)}/evolution`,
      { signal },
    ),

  getChampionMatches: (
    name: string,
    params?: Filters & { role?: string },
    signal?: AbortSignal,
  ) =>
    fetchAPI<ChampionMatch[]>(
      `/api/champions/${encodeURIComponent(name)}/matches` + buildQuery(params),
      { signal },
    ),

  analyzeDraft: (draft: DraftState, signal?: AbortSignal) =>
    fetchAPI<DraftAnalysis>("/api/draft/analyze", {
      method: "POST",
      body: JSON.stringify(draft),
      signal,
    }),

  recommendPicks: (draft: DraftState, slot: string, signal?: AbortSignal) =>
    fetchAPI<PickRecommendation[]>(
      `/api/draft/recommend?slot=${slot}`,
      { method: "POST", body: JSON.stringify(draft), signal },
    ),

  getAvailableChampions: (draft: DraftState, signal?: AbortSignal) =>
    fetchAPI<string[]>("/api/draft/available", {
      method: "POST",
      body: JSON.stringify(draft),
      signal,
    }),

  getTeams: (signal?: AbortSignal) =>
    fetchAPI<string[]>("/api/teams", { signal }),

  getTeamDraft: (name: string, signal?: AbortSignal) =>
    fetchAPI<TeamDraftHistory>(
      `/api/teams/${encodeURIComponent(name)}/draft`,
      { signal },
    ),

  getLeagues: (signal?: AbortSignal) =>
    fetchAPI<string[]>("/api/leagues", { signal }),

  getPatches: (signal?: AbortSignal) =>
    fetchAPI<string[]>("/api/patches", { signal }),

  getMatch: (gameid: string, signal?: AbortSignal) =>
    fetchAPI<MatchDetail>(
      `/api/matches/${encodeURIComponent(gameid)}`,
      { signal },
    ),
};
