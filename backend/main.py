from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import draft_engine as engine
from models import (
    ChampionStats,
    DraftAnalysis,
    DraftState,
    PickRecommendation,
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
) -> list[ChampionStats]:
    stats = engine.get_all_champions()
    if role:
        stats = [s for s in stats if s.role == role]
    return stats


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
) -> list[dict]:
    return engine.get_counters(name, role)


@app.get("/api/champions/{name}/synergies")
def get_champion_synergies(name: str) -> list[dict]:
    return engine.get_synergies(name)


@app.post("/api/draft/analyze")
def analyze_draft(draft: DraftState) -> DraftAnalysis:
    return engine.calculate_winrate(draft)


@app.post("/api/draft/recommend")
def recommend_picks(
    draft: DraftState,
    slot: str = Query(..., description="Slot to recommend for, e.g. 'blue_mid'"),
) -> list[PickRecommendation]:
    if slot not in [
        f"{side}_{role}"
        for side in ["blue", "red"]
        for role in ["top", "jng", "mid", "bot", "sup"]
    ]:
        raise HTTPException(status_code=400, detail=f"Invalid slot: {slot}")
    return engine.recommend_picks(draft, slot)


@app.get("/api/draft/available")
def available_champions(draft: DraftState) -> list[str]:
    return engine.get_available_champions(draft)


@app.get("/api/teams")
def list_teams() -> list[str]:
    return engine.get_teams()


@app.get("/api/teams/{name}/draft")
def team_draft_history(name: str) -> list[dict]:
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
