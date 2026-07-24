from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import draft_engine as engine
from models import (
    ChampionStats,
    CounterResult,
    DraftAnalysis,
    DraftState,
    PickRecommendation,
    SynergyResult,
    TeamDraftRecord,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.init_engine()
    yield


app = FastAPI(
    title="LoL Draft Analyzer API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/champions")
def list_champions(
    role: str | None = Query(None, description="Filter by role"),
    league: str | None = Query(None, description="Filter by league"),
    patch: str | None = Query(None, description="Filter by patch"),
    date_from: str | None = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: str | None = Query(None, description="Filter to date (YYYY-MM-DD)"),
) -> list[ChampionStats]:
    return engine.get_all_champions(
        league=league, patch=patch, date_from=date_from, date_to=date_to, role=role,
    )


@app.get("/api/champions/{name}")
def get_champion(name: str) -> list[ChampionStats]:
    stats = engine.get_champion_detail(name)
    if not stats:
        raise HTTPException(status_code=404, detail=f"Champion '{name}' not found")
    return stats


@app.get("/api/champions/{name}/counters")
def get_champion_counters(
    name: str,
    role: str = Query(..., description="Role to check counters for"),
) -> list[CounterResult]:
    return engine.get_counters(name, role)


@app.get("/api/champions/{name}/matches")
def get_champion_matches(
    name: str,
    role: str | None = Query(None, description="Filter by role"),
    league: str | None = Query(None, description="Filter by league"),
    patch: str | None = Query(None, description="Filter by patch"),
    date_from: str | None = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: str | None = Query(None, description="Filter to date (YYYY-MM-DD)"),
) -> list[dict]:
    return engine.get_champion_matches(
        name, league=league, patch=patch, date_from=date_from, date_to=date_to, role=role,
    )


@app.get("/api/champions/{name}/synergies")
def get_champion_synergies(name: str) -> list[SynergyResult]:
    return engine.get_synergies(name)


@app.post("/api/draft/analyze")
def analyze_draft(draft: DraftState) -> DraftAnalysis:
    return engine.calculate_winrate(draft)


@app.post("/api/draft/recommend")
def recommend_picks(
    draft: DraftState,
    slot: str = Query(..., description="Slot to recommend for, e.g. 'blue_mid'"),
) -> list[PickRecommendation]:
    if slot not in engine.VALID_SLOTS:
        raise HTTPException(status_code=400, detail=f"Invalid slot: {slot}")
    return engine.recommend_picks(draft, slot)


@app.post("/api/draft/available")
def available_champions(draft: DraftState) -> list[str]:
    return engine.get_available_champions(draft)


@app.get("/api/teams")
def list_teams() -> list[str]:
    return engine.get_teams()


@app.get("/api/teams/{name}/draft")
def team_draft_history(name: str) -> list[TeamDraftRecord]:
    records = engine.get_team_draft(name)
    if not records:
        raise HTTPException(status_code=404, detail=f"Team '{name}' not found")
    return records


@app.get("/api/leagues")
def list_leagues() -> list[str]:
    return engine.get_leagues()


@app.get("/api/patches")
def list_patches() -> list[str]:
    return engine.get_patches()


@app.get("/api/matches/{gameid}")
def get_match(gameid: str) -> dict:
    match = engine.get_match(gameid)
    if not match:
        raise HTTPException(status_code=404, detail=f"Match '{gameid}' not found")
    return match


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
