from pydantic import BaseModel


class DraftState(BaseModel):
    gameid: str | None = None
    league: str | None = None
    patch: str | None = None

    blue_bans: list[str] = []
    red_bans: list[str] = []

    blue_top: str | None = None
    blue_jng: str | None = None
    blue_mid: str | None = None
    blue_bot: str | None = None
    blue_sup: str | None = None
    red_top: str | None = None
    red_jng: str | None = None
    red_mid: str | None = None
    red_bot: str | None = None
    red_sup: str | None = None


class Factor(BaseModel):
    name: str
    impact: float
    description: str
    games: int | None = None


class DraftAnalysis(BaseModel):
    blue_winrate: float
    red_winrate: float
    blue_confidence: str
    red_confidence: str
    factors: list[Factor]


class PickRecommendation(BaseModel):
    champion: str
    role: str
    predicted_winrate: float
    confidence: str
    factors: list[Factor]


class ChampionStats(BaseModel):
    name: str
    role: str
    games: int
    wins: int
    winrate: float
    pickrate: float
    banrate: float


class CounterResult(BaseModel):
    champion: str
    games: int
    winrate_against: float
    description: str


class SynergyResult(BaseModel):
    champion: str
    games: int
    winrate_together: float
    description: str


class TeamDraftRecord(BaseModel):
    gameid: str
    league: str
    date: str
    side: str
    opponent: str
    result: str
    bans: list[str]
    picks: dict[str, str | None]
