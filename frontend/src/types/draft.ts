export type Side = "Blue" | "Red";
export type Role = "top" | "jng" | "mid" | "bot" | "sup";

export interface DraftState {
  gameid: string | null;
  league: string | null;
  patch: string | null;
  blue_bans: string[];
  red_bans: string[];
  blue_top: string | null;
  blue_jng: string | null;
  blue_mid: string | null;
  blue_bot: string | null;
  blue_sup: string | null;
  red_top: string | null;
  red_jng: string | null;
  red_mid: string | null;
  red_bot: string | null;
  red_sup: string | null;
}

export interface Factor {
  name: string;
  impact: number;
  description: string;
}

export interface DraftAnalysis {
  blue_winrate: number;
  red_winrate: number;
  blue_confidence: "low" | "medium" | "high";
  red_confidence: "low" | "medium" | "high";
  factors: Factor[];
}

export interface ChampionStats {
  name: string;
  role: string;
  games: number;
  wins: number;
  winrate: number;
  pickrate: number;
  banrate: number;
}

export interface PickRecommendation {
  champion: string;
  role: string;
  predicted_winrate: number;
  confidence: string;
  factors: Factor[];
}

export interface ChampionDetail {
  name: string;
  global_wr: number;
  roles: ChampionStats[];
  top_counters: { champion: string; wr: number }[];
  top_synergies: { champion: string; wr: number }[];
}

export interface TeamDraftHistory {
  teamname: string;
  matches: {
    gameid: string;
    date: string;
    opponent: string;
    side: string;
    bans: string[];
    picks: string[];
    result: number;
  }[];
}

export interface MatchDetail {
  gameid: string;
  league: string;
  patch: string;
  date: string;
  duration: string;
  blue: {
    teamname: string;
    bans: string[];
    top: string;
    jng: string;
    mid: string;
    bot: string;
    sup: string;
    result: number;
    kills: number;
    deaths: number;
    assists: number;
  };
  red: {
    teamname: string;
    bans: string[];
    top: string;
    jng: string;
    mid: string;
    bot: string;
    sup: string;
    result: number;
    kills: number;
    deaths: number;
    assists: number;
  };
}

export interface Filters {
  league?: string;
  patch?: string;
  date_from?: string;
  date_to?: string;
}
