from __future__ import annotations

import os
from collections import defaultdict
from itertools import combinations

import pandas as pd

from models import (
    CounterResult,
    DraftAnalysis,
    DraftState,
    Factor,
    PickRecommendation,
    SynergyResult,
    TeamDraftRecord,
)

ROLES = ["top", "jng", "mid", "bot", "sup"]
SIDES = ["Blue", "Red"]
VALID_SLOTS = [f"{side}_{role}" for side in ["blue", "red"] for role in ROLES]

SIDE_BLUE_BASE = 0.5309
SIDE_RED_BASE = 0.4691

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "draft_data.csv")

tables: dict[str, pd.DataFrame | dict] = {}
CHAMPION_LIST: list[str] = []

STAT_FIELDS: list[tuple[str, str, object]] = [
    ("kills", "kills", 0),
    ("deaths", "deaths", 0),
    ("assists", "assists", 0),
    ("teamkills", "teamkills", 0),
    ("teamdeaths", "teamdeaths", 0),
    ("doublekills", "doublekills", 0),
    ("triplekills", "triplekills", 0),
    ("quadrakills", "quadrakills", 0),
    ("pentakills", "pentakills", 0),
    ("firstblood", "firstblood", None),
    ("team kpm", "team_kpm", 0),
    ("ckpm", "ckpm", 0),
    ("firstdragon", "firstdragon", None),
    ("dragons", "dragons", 0),
    ("opp_dragons", "opp_dragons", 0),
    ("elementaldrakes", "elementaldrakes", 0),
    ("opp_elementaldrakes", "opp_elementaldrakes", 0),
    ("elders", "elders", 0),
    ("opp_elders", "opp_elders", 0),
    ("firstherald", "firstherald", None),
    ("heralds", "heralds", 0),
    ("opp_heralds", "opp_heralds", 0),
    ("void_grubs", "void_grubs", 0),
    ("opp_void_grubs", "opp_void_grubs", 0),
    ("firstbaron", "firstbaron", None),
    ("barons", "barons", 0),
    ("opp_barons", "opp_barons", 0),
    ("firsttower", "firsttower", None),
    ("towers", "towers", 0),
    ("opp_towers", "opp_towers", 0),
    ("firstmidtower", "firstmidtower", None),
    ("firsttothreetowers", "firsttothreetowers", None),
    ("turretplates", "turretplates", 0),
    ("opp_turretplates", "opp_turretplates", 0),
    ("inhibitors", "inhibitors", 0),
    ("opp_inhibitors", "opp_inhibitors", 0),
    ("damagetochampions", "damagetochampions", 0),
    ("dpm", "dpm", 0),
    ("damagetakenperminute", "damagetakenperminute", 0),
    ("damagetotowers", "damagetotowers", 0),
    ("wardsplaced", "wardsplaced", 0),
    ("wpm", "wpm", 0),
    ("visionscore", "visionscore", 0),
    ("vspm", "vspm", 0),
    ("totalgold", "totalgold", 0),
    ("earnedgold", "earnedgold", 0),
    ("goldspent", "goldspent", 0),
    ("minionkills", "minionkills", 0),
    ("monsterkills", "monsterkills", 0),
    ("cspm", "cspm", 0),
]


def _load_data(path: str = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path, quotechar='"')
    df = df[df["datacompleteness"] == "complete"].copy()
    df["result"] = df["result"].astype(int)
    return df


def _build_champion_role_wr(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df.iterrows():
        side = row["side"]
        won = row["result"]
        prefix = side.lower()
        for role in ROLES:
            champ = row.get(f"{prefix}_{role}")
            if pd.notna(champ):
                rows.append({
                    "side": side,
                    "role": role,
                    "champion": champ,
                    "won": won,
                })
    tmp = pd.DataFrame(rows)
    grouped = tmp.groupby(["side", "role", "champion"]).agg(
        games=("won", "count"),
        wins=("won", "sum"),
    ).reset_index()
    grouped["wr"] = grouped["wins"] / grouped["games"]
    return grouped


def _build_champion_role_wr_aggregated(df: pd.DataFrame) -> pd.DataFrame:
    by_side = _build_champion_role_wr(df)
    agg = by_side.groupby(["role", "champion"]).agg(
        games=("games", "sum"),
        wins=("wins", "sum"),
    ).reset_index()
    agg["wr"] = agg["wins"] / agg["games"]
    return agg


def _build_matchup_wr(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df[df["side"] == "Blue"].iterrows():
        won = row["result"]
        for role in ROLES:
            b_champ = row.get(f"blue_{role}")
            r_champ = row.get(f"red_{role}")
            if pd.notna(b_champ) and pd.notna(r_champ):
                rows.append({
                    "role": role,
                    "champ_a": b_champ,
                    "champ_b": r_champ,
                    "a_won": int(won == 1),
                })
    tmp = pd.DataFrame(rows)
    grouped = tmp.groupby(["role", "champ_a", "champ_b"]).agg(
        games=("a_won", "count"),
        a_wins=("a_won", "sum"),
    ).reset_index()
    grouped["wr"] = grouped["a_wins"] / grouped["games"]
    return grouped


def _build_synergy_wr(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df[df["side"] == "Blue"].iterrows():
        won = row["result"]
        for side in SIDES:
            prefix = side.lower()
            picks = [row.get(f"{prefix}_{r}") for r in ROLES if pd.notna(row.get(f"{prefix}_{r}"))]
            team_won = (side == "Blue" and won == 1) or (side == "Red" and won == 0)
            for a, b in combinations(sorted(picks), 2):
                rows.append({
                    "side": side,
                    "champ_a": a,
                    "champ_b": b,
                    "won": int(team_won),
                })
    tmp = pd.DataFrame(rows)
    grouped = tmp.groupby(["champ_a", "champ_b"]).agg(
        games=("won", "count"),
        wins=("won", "sum"),
    ).reset_index()
    grouped["wr"] = grouped["wins"] / grouped["games"]
    return grouped


def _build_side_base_wr(df: pd.DataFrame) -> dict:
    grouped = df.groupby("side")["result"].mean()
    return {
        "Blue": float(grouped.get("Blue", SIDE_BLUE_BASE)),
        "Red": float(grouped.get("Red", SIDE_RED_BASE)),
    }


def _build_ban_rates(df: pd.DataFrame) -> dict[str, float]:
    total_matches = df["gameid"].nunique()
    if total_matches == 0:
        return {}
    ban_counts: dict[str, int] = defaultdict(int)
    for _, row in df.iterrows():
        for col in ["ban1", "ban2", "ban3", "ban4", "ban5"]:
            champ = row.get(col)
            if pd.notna(champ):
                ban_counts[champ] += 1
    return {k: v / total_matches for k, v in ban_counts.items()}


def init_engine(path: str = DATA_PATH) -> None:
    global CHAMPION_LIST
    df = _load_data(path)

    tables["champion_role_wr"] = _build_champion_role_wr(df)
    tables["champion_role_wr_agg"] = _build_champion_role_wr_aggregated(df)
    tables["matchup_wr"] = _build_matchup_wr(df)
    tables["synergy_wr"] = _build_synergy_wr(df)
    tables["side_base_wr"] = _build_side_base_wr(df)
    tables["ban_rates"] = _build_ban_rates(df)
    tables["raw"] = df

    all_champs = set()
    for role in ROLES:
        for prefix in ["blue", "red"]:
            col = f"{prefix}_{role}"
            all_champs.update(df[col].dropna().unique())
    CHAMPION_LIST = sorted(all_champs)

    assert len(tables["champion_role_wr"]) > 0, "No champion role data"
    assert len(tables["matchup_wr"]) > 0, "No matchup data"
    assert len(tables["synergy_wr"]) > 0, "No synergy data"
    blue_wr = tables["side_base_wr"]["Blue"]
    red_wr = tables["side_base_wr"]["Red"]
    assert abs(blue_wr - 0.53) < 0.02, f"Blue WR unexpected: {blue_wr}"
    assert abs(red_wr - 0.47) < 0.02, f"Red WR unexpected: {red_wr}"


def _filter_df(
    df: pd.DataFrame | None = None,
    *,
    league: str | None = None,
    patch: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
) -> pd.DataFrame:
    if df is None:
        df = tables["raw"]
    if league:
        df = df[df["league"] == league]
    if patch:
        df = df[df["patch"].astype(str) == str(patch)]
    if date_from:
        df = df[df["date"] >= date_from]
    if date_to:
        df = df[df["date"] <= date_to]
    return df


def _recompute_filtered_tables(draft: DraftState) -> None:
    df = _filter_df(league=draft.league, patch=draft.patch)
    tables["filtered_side_base"] = _build_side_base_wr(df)


def get_champion_wr(champion: str, role: str, side: str) -> tuple[float, int]:
    row = tables["champion_role_wr"][
        (tables["champion_role_wr"]["champion"] == champion)
        & (tables["champion_role_wr"]["role"] == role)
        & (tables["champion_role_wr"]["side"] == side)
    ]
    if row.empty or row["games"].iloc[0] < 5:
        return 0.5, 0
    return float(row["wr"].iloc[0]), int(row["games"].iloc[0])


def get_matchup_wr(champ_a: str, champ_b: str, role: str) -> tuple[float, int]:
    row = tables["matchup_wr"][
        (tables["matchup_wr"]["champ_a"] == champ_a)
        & (tables["matchup_wr"]["champ_b"] == champ_b)
        & (tables["matchup_wr"]["role"] == role)
    ]
    if row.empty or row["games"].iloc[0] < 5:
        return 0.5, 0
    return float(row["wr"].iloc[0]), int(row["games"].iloc[0])


def get_synergy_wr(champ_a: str, champ_b: str) -> tuple[float, int]:
    row = tables["synergy_wr"][
        (tables["synergy_wr"]["champ_a"] == champ_a)
        & (tables["synergy_wr"]["champ_b"] == champ_b)
    ]
    if row.empty or row["games"].iloc[0] < 5:
        return 0.5, 0
    return float(row["wr"].iloc[0]), int(row["games"].iloc[0])


def _compute_synergy_impact(picks: list[str], sign: int) -> tuple[float, Factor]:
    n_pairs = len(picks) * (len(picks) - 1) / 2
    total_impact = sum(
        (get_synergy_wr(a, b) - 0.5) * 0.20 / n_pairs
        for a, b in combinations(picks, 2)
    )
    side_label = "Blue" if sign > 0 else "Red"
    return total_impact * sign, Factor(
        name=f"{side_label} team synergy",
        impact=-total_impact * sign,
        description=f"{len(picks)} champions on {side_label} team",
    )


def _to_native(v: object) -> object:
    if pd.isna(v):
        return None
    if hasattr(v, "item"):
        return v.item()
    return v


def _extract_stats(row: pd.Series) -> dict:
    stats: dict = {}
    for csv_col, key, default in STAT_FIELDS:
        v = row.get(csv_col)
        if pd.isna(v):
            stats[key] = default if default is not None else None
        elif hasattr(v, "item"):
            stats[key] = v.item()
        else:
            stats[key] = v
    return stats


def _build_side_info(row: pd.Series, side_prefix: str) -> dict:
    role_data = {}
    for role in ROLES:
        champ = row.get(f"{side_prefix}_{role}")
        player_name = row.get(f"{side_prefix}_{role}_player")
        role_data[role] = {
            "champion": champ if pd.notna(champ) else None,
            "player": player_name if pd.notna(player_name) else None,
        }
    bans = [row.get(f"ban{i}") for i in range(1, 6) if pd.notna(row.get(f"ban{i}"))]
    stats = _extract_stats(row)
    return {
        "name": row["teamname"],
        "side": row["side"],
        "result": _to_native(row["result"]),
        "bans": bans,
        "roles": role_data,
        **stats,
    }


def calculate_winrate(draft: DraftState) -> DraftAnalysis:
    _recompute_filtered_tables(draft)

    if "filtered_side_base" in tables:
        blue_wr = tables["filtered_side_base"]["Blue"]
        red_wr = tables["filtered_side_base"]["Red"]
    else:
        blue_wr = SIDE_BLUE_BASE
        red_wr = SIDE_RED_BASE

    factors: list[Factor] = []

    base_diff = blue_wr - red_wr
    factors.append(Factor(
        name="Side bonus",
        impact=base_diff,
        description=f"Blue side has {blue_wr:.1%} base WR",
    ))

    for role in ROLES:
        blue_champ = getattr(draft, f"blue_{role}")
        red_champ = getattr(draft, f"red_{role}")
        if blue_champ:
            stat, games = get_champion_wr(blue_champ, role, "Blue")
            impact = (stat - 0.5) * 0.4
            blue_wr += impact
            factors.append(Factor(
                name=f"{blue_champ} {role}",
                impact=impact,
                description=f"{stat:.1%} WR as {role} (Blue)",
                games=games,
            ))
        if red_champ:
            stat, games = get_champion_wr(red_champ, role, "Red")
            impact = (stat - 0.5) * 0.4
            red_wr += impact
            factors.append(Factor(
                name=f"{red_champ} {role}",
                impact=-impact,
                description=f"{stat:.1%} WR as {role} (Red)",
                games=games,
            ))

    for role in ROLES:
        blue_champ = getattr(draft, f"blue_{role}")
        red_champ = getattr(draft, f"red_{role}")
        if blue_champ and red_champ:
            matchup, games = get_matchup_wr(blue_champ, red_champ, role)
            impact = (matchup - 0.5) * 0.25
            blue_wr += impact
            factors.append(Factor(
                name=f"{blue_champ} vs {red_champ}",
                impact=impact,
                description=f"{matchup:.1%} matchup WR in {role}",
                games=games,
            ))

    blue_picks = [getattr(draft, f"blue_{r}") for r in ROLES if getattr(draft, f"blue_{r}")]
    red_picks = [getattr(draft, f"red_{r}") for r in ROLES if getattr(draft, f"red_{r}")]

    if len(blue_picks) >= 2:
        impact, factor = _compute_synergy_impact(blue_picks, sign=1)
        blue_wr += impact
        factors.append(factor)

    if len(red_picks) >= 2:
        impact, factor = _compute_synergy_impact(red_picks, sign=-1)
        red_wr += impact
        factors.append(factor)

    total = blue_wr + red_wr
    if total > 0:
        blue_wr /= total
    red_wr = 1.0 - blue_wr

    confidence = calculate_confidence(draft)

    return DraftAnalysis(
        blue_winrate=round(blue_wr * 100, 1),
        red_winrate=round(red_wr * 100, 1),
        blue_confidence=confidence,
        red_confidence=confidence,
        factors=factors,
    )


def calculate_confidence(draft: DraftState) -> str:
    filled = sum(
        1 for r in ROLES
        if getattr(draft, f"blue_{r}") or getattr(draft, f"red_{r}")
    )
    if filled <= 2:
        return "low"
    if filled <= 5:
        return "medium"
    return "high"


def get_available_champions(draft: DraftState) -> list[str]:
    all_champs = set(CHAMPION_LIST)
    banned = set(draft.blue_bans + draft.red_bans)
    picked = {
        getattr(draft, f"{side}_{role}")
        for side in ["blue", "red"]
        for role in ROLES
        if getattr(draft, f"{side}_{role}")
    }
    return sorted(all_champs - banned - picked)


def recommend_picks(draft: DraftState, slot: str) -> list[PickRecommendation]:
    available = get_available_champions(draft)
    role = slot.split("_")[1]
    side = slot.split("_")[0]

    recommendations = []
    for champ in available:
        setattr(draft, slot, champ)
        analysis = calculate_winrate(draft)
        wr = analysis.blue_winrate if side == "blue" else analysis.red_winrate

        recommendations.append(PickRecommendation(
            champion=champ,
            role=role,
            predicted_winrate=round(wr, 1),
            confidence=analysis.blue_confidence,
            factors=analysis.factors,
        ))
        setattr(draft, slot, None)

    return sorted(recommendations, key=lambda x: x.predicted_winrate, reverse=True)[:20]


def get_all_champions(
    league: str | None = None,
    patch: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    role: str | None = None,
) -> list[ChampionStats]:
    from models import ChampionStats

    df = _filter_df(league=league, patch=patch, date_from=date_from, date_to=date_to)

    if len(df) == 0:
        return []

    total_matches = df["gameid"].nunique()
    ban_rates = _build_ban_rates(df)

    agg = _build_champion_role_wr_aggregated(df)

    if role:
        agg = agg[agg["role"] == role]

    stats = []
    for _, row in agg.iterrows():
        pickrate = row["games"] / total_matches if total_matches else 0
        stats.append(ChampionStats(
            name=row["champion"],
            role=row["role"],
            games=int(row["games"]),
            wins=int(row["wins"]),
            winrate=round(row["wr"] * 100, 1),
            pickrate=round(pickrate * 100, 1),
            banrate=round(ban_rates.get(row["champion"], 0) * 100, 1),
        ))
    return stats


def get_champion_detail(name: str) -> list[ChampionStats]:
    from models import ChampionStats

    total_matches = tables["raw"]["gameid"].nunique()
    ban_rates = tables["ban_rates"]

    subset = tables["champion_role_wr_agg"][tables["champion_role_wr_agg"]["champion"] == name]
    stats = []
    for _, row in subset.iterrows():
        pickrate = row["games"] / total_matches if total_matches else 0
        stats.append(ChampionStats(
            name=row["champion"],
            role=row["role"],
            games=int(row["games"]),
            wins=int(row["wins"]),
            winrate=round(row["wr"] * 100, 1),
            pickrate=round(pickrate * 100, 1),
            banrate=round(ban_rates.get(name, 0) * 100, 1),
        ))
    return stats


def get_counters(champion: str, role: str) -> list[CounterResult]:
    subset_a = tables["matchup_wr"][
        (tables["matchup_wr"]["champ_a"] == champion)
        & (tables["matchup_wr"]["role"] == role)
        & (tables["matchup_wr"]["games"] >= 5)
    ]
    subset_b = tables["matchup_wr"][
        (tables["matchup_wr"]["champ_b"] == champion)
        & (tables["matchup_wr"]["role"] == role)
        & (tables["matchup_wr"]["games"] >= 5)
    ]
    results = []
    for _, row in subset_a.iterrows():
        results.append(CounterResult(
            champion=row["champ_b"],
            games=int(row["games"]),
            winrate_against=round(1.0 - row["wr"], 4),
            description=f"{row['champ_b']} beats {champion} {((1 - row['wr']) * 100):.1f}% of the time",
        ))
    for _, row in subset_b.iterrows():
        results.append(CounterResult(
            champion=row["champ_a"],
            games=int(row["games"]),
            winrate_against=round(row["wr"], 4),
            description=f"{row['champ_a']} beats {champion} {(row['wr'] * 100):.1f}% of the time",
        ))
    seen = {}
    for r in results:
        if r.champion not in seen or r.games > seen[r.champion].games:
            seen[r.champion] = r
    return sorted(seen.values(), key=lambda x: x.winrate_against, reverse=True)


def get_synergies(champion: str) -> list[SynergyResult]:
    subset = tables["synergy_wr"][
        (
            (tables["synergy_wr"]["champ_a"] == champion)
            | (tables["synergy_wr"]["champ_b"] == champion)
        )
        & (tables["synergy_wr"]["games"] >= 5)
    ]
    results = []
    for _, row in subset.iterrows():
        partner = row["champ_b"] if row["champ_a"] == champion else row["champ_a"]
        results.append(SynergyResult(
            champion=partner,
            games=int(row["games"]),
            winrate_together=round(row["wr"], 4),
            description=f"{champion} + {partner} win {row['wr']:.1%} together",
        ))
    return sorted(results, key=lambda x: x.winrate_together, reverse=True)


def get_teams() -> list[str]:
    return sorted(tables["raw"]["teamname"].dropna().unique().tolist())


def get_team_draft(team_name: str) -> list[TeamDraftRecord]:
    df = tables["raw"][tables["raw"]["teamname"] == team_name]
    records = []
    for _, row in df.iterrows():
        picks = {
            role: row.get(f"blue_{role}") if row["side"] == "Blue" else row.get(f"red_{role}")
            for role in ROLES
        }
        records.append(TeamDraftRecord(
            gameid=row["gameid"],
            league=row["league"],
            date=str(row["date"]),
            side=row["side"],
            opponent=row["opponent_name"],
            result="Win" if row["result"] == 1 else "Loss",
            bans=[row[f"ban{i}"] for i in range(1, 6) if pd.notna(row.get(f"ban{i}"))],
            picks=picks,
        ))
    return records


def get_champion_matches(
    champion: str,
    league: str | None = None,
    patch: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    role: str | None = None,
) -> list[dict]:
    df = _filter_df(league=league, patch=patch, date_from=date_from, date_to=date_to)

    matches_with_champ = set()
    for r in ROLES:
        for prefix in ["blue", "red"]:
            col = f"{prefix}_{r}"
            found = df[df[col] == champion]["gameid"].unique()
            matches_with_champ.update(found)

    df = df[df["gameid"].isin(matches_with_champ)].copy()

    results = []
    for gameid, group in df.groupby("gameid"):
        blue_row = group[group["side"] == "Blue"]
        red_row = group[group["side"] == "Red"]

        if blue_row.empty or red_row.empty:
            continue

        blue_info = blue_row.iloc[0]
        red_info = red_row.iloc[0]

        blue_side = _build_side_info(blue_info, "blue")
        red_side = _build_side_info(red_info, "red")

        if role:
            champion_found = any(
                side_data["roles"].get(role, {}).get("champion") == champion
                for side_data in (blue_side, red_side)
            )
            if not champion_found:
                continue

        results.append({
            "gameid": gameid,
            "league": blue_info.get("league"),
            "date": str(blue_info.get("date")),
            "patch": str(blue_info.get("patch")),
            "gamelength": _to_native(blue_info.get("gamelength", 0)),
            "blue": blue_side,
            "red": red_side,
        })

    results.sort(key=lambda x: x["date"], reverse=True)
    return results


def get_leagues() -> list[str]:
    return sorted(tables["raw"]["league"].dropna().unique().tolist())


def get_patches() -> list[str]:
    return sorted(tables["raw"]["patch"].dropna().astype(str).unique().tolist())


def get_champion_evolution(champion: str) -> list[dict]:
    df = tables["raw"]
    rows = []
    for _, row in df[df["side"] == "Blue"].iterrows():
        won = row["result"]
        for role in ROLES:
            for prefix in ["blue", "red"]:
                col = f"{prefix}_{role}"
                if pd.notna(row.get(col)) and row[col] == champion:
                    rows.append({
                        "patch": str(row.get("patch", "")),
                        "won": int(won == 1) if prefix == "blue" else int(won == 0),
                    })
    if not rows:
        return []
    tmp = pd.DataFrame(rows)
    grouped = tmp.groupby("patch").agg(
        games=("won", "count"),
        wins=("won", "sum"),
    ).reset_index()
    grouped["winrate"] = grouped["wins"] / grouped["games"]
    grouped = grouped.sort_values("patch")
    return [
        {"patch": row["patch"], "games": int(row["games"]), "winrate": round(row["winrate"] * 100, 1)}
        for _, row in grouped.iterrows()
    ]


def get_match(gameid: str) -> dict | None:
    df = tables["raw"][tables["raw"]["gameid"] == gameid]
    if df.empty:
        return None
    result = {
        "gameid": gameid,
        "league": df.iloc[0]["league"],
        "date": str(df.iloc[0]["date"]),
        "patch": str(df.iloc[0]["patch"]),
        "gamelength": _to_native(df.iloc[0]["gamelength"]),
        "blue_team": None,
        "red_team": None,
    }
    for _, row in df.iterrows():
        side = row["side"].lower()
        side_info = _build_side_info(row, side)
        result[f"{side}_team"] = {
            "name": side_info["name"],
            "bans": side_info["bans"],
            "roles": side_info["roles"],
            "result": "Win" if row["result"] == 1 else "Loss",
            **{k: v for k, v in side_info.items() if k not in ("name", "side", "result", "bans", "roles")},
        }
    return result
