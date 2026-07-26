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
  games?: number;
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

export interface TeamInfo {
  name: string;
  leagues: string[];
  logo?: string;
}

export interface TeamDraftHistory {
  teamname: string;
  matches: {
    gameid: string;
    date: string;
    opponent: string;
    side: string;
    bans: string[];
    picks: Record<string, string | null>;
    result: string;
  }[];
}

export interface MatchSideData {
  teamname: string;
  bans: string[];
  roles: Record<string, { champion: string | null; player: string | null; damage: number; kills: number; deaths: number; assists: number }>;
  result: string;
  kills: number;
  deaths: number;
  assists: number;
  teamkills: number;
  teamdeaths: number;
  dragons: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  elders: number;
  barons: number;
  towers: number;
  inhibitors: number;
  damagetochampions: number;
  totalgold: number;
  visionscore: number;
  minionkills: number;
}

export interface MatchDetail {
  gameid: string;
  league: string;
  patch: string;
  date: string;
  gamelength: number;
  blue: MatchSideData;
  red: MatchSideData;
}

export interface ChampionMatchRole {
  champion: string | null;
  player: string | null;
  damage: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface ChampionMatchSide {
  name: string;
  side: string;
  result: number;
  bans: string[];
  roles: Record<string, ChampionMatchRole>;
  kills: number;
  deaths: number;
  assists: number;
  teamkills: number;
  teamdeaths: number;
  doublekills: number;
  triplekills: number;
  quadrakills: number;
  pentakills: number;
  firstblood: boolean | null;
  dragons: number;
  opp_dragons: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  elders: number;
  opp_elders: number;
  heralds: number;
  opp_heralds: number;
  void_grubs: number;
  opp_void_grubs: number;
  barons: number;
  opp_barons: number;
  towers: number;
  opp_towers: number;
  inhibitors: number;
  opp_inhibitors: number;
  damagetochampions: number;
  dpm: number;
  wardsplaced: number;
  visionscore: number;
  totalgold: number;
  earnedgold: number;
  goldspent: number;
  minionkills: number;
  monsterkills: number;
}

export interface ChampionMatch {
  gameid: string;
  league: string;
  date: string;
  patch: string;
  gamelength: number;
  blue: ChampionMatchSide;
  red: ChampionMatchSide;
}

export interface CounterResult {
  champion: string;
  games: number;
  winrate_against: number;
  description: string;
}

export interface SynergyResult {
  champion: string;
  games: number;
  winrate_together: number;
  description: string;
}

export interface PatchEvolution {
  patch: string;
  games: number;
  winrate: number;
}

export interface Filters {
  league?: string;
  patch?: string;
  date_from?: string;
  date_to?: string;
  role?: string;
}
