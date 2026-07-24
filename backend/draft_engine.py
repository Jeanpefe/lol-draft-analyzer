from __future__ import annotations

import os
from collections import defaultdict
from itertools import combinations

import pandas as pd

from models import DraftAnalysis, DraftState, Factor, PickRecommendation

ROLES = ["top", "jng", "mid", "bot", "sup"]
SIDES = ["Blue", "Red"]

SIDE_BLUE_BASE = 0.5309
SIDE_RED_BASE = 0.4691

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "draft_data.csv")

tables: dict[str, pd.DataFrame | dict] = {}
CHAMPION_LIST: list[str] = []


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


def _build_matchup_wr(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df.iterrows():
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
    for _, row in df.iterrows():
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


def _filter_df(draft: DraftState) -> pd.DataFrame:
    df = tables["raw"]
    if draft.league:
        df = df[df["league"] == draft.league]
    if draft.patch:
        df = df[df["patch"].astype(str) == str(draft.patch)]
    return df


def _recompute_filtered_tables(draft: DraftState) -> None:
    df = _filter_df(draft)
    tables["filtered_side_base"] = _build_side_base_wr(df)


def get_champion_wr(champion: str, role: str, side: str) -> float:
    row = tables["champion_role_wr"][
        (tables["champion_role_wr"]["champion"] == champion)
        & (tables["champion_role_wr"]["role"] == role)
        & (tables["champion_role_wr"]["side"] == side)
    ]
    if row.empty or row["games"].iloc[0] < 5:
        return 0.5
    return float(row["wr"].iloc[0])


def get_matchup_wr(champ_a: str, champ_b: str, role: str) -> float:
    row = tables["matchup_wr"][
        (tables["matchup_wr"]["champ_a"] == champ_a)
        & (tables["matchup_wr"]["champ_b"] == champ_b)
        & (tables["matchup_wr"]["role"] == role)
    ]
    if row.empty or row["games"].iloc[0] < 5:
        return 0.5
    return float(row["wr"].iloc[0])


def get_synergy_wr(champ_a: str, champ_b: str) -> float:
    row = tables["synergy_wr"][
        (tables["synergy_wr"]["champ_a"] == champ_a)
        & (tables["synergy_wr"]["champ_b"] == champ_b)
    ]
    if row.empty or row["games"].iloc[0] < 5:
        return 0.5
    return float(row["wr"].iloc[0])


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
            stat = get_champion_wr(blue_champ, role, "Blue")
            impact = (stat - 0.5) * 0.4
            blue_wr += impact
            factors.append(Factor(
                name=f"{blue_champ} {role}",
                impact=impact,
                description=f"{stat:.1%} WR as {role} (Blue)",
            ))
        if red_champ:
            stat = get_champion_wr(red_champ, role, "Red")
            impact = (stat - 0.5) * 0.4
            red_wr += impact
            factors.append(Factor(
                name=f"{red_champ} {role}",
                impact=-impact,
                description=f"{stat:.1%} WR as {role} (Red)",
            ))

    for role in ROLES:
        blue_champ = getattr(draft, f"blue_{role}")
        red_champ = getattr(draft, f"red_{role}")
        if blue_champ and red_champ:
            matchup = get_matchup_wr(blue_champ, red_champ, role)
            impact = (matchup - 0.5) * 0.25
            blue_wr += impact
            factors.append(Factor(
                name=f"{blue_champ} vs {red_champ}",
                impact=impact,
                description=f"{matchup:.1%} matchup WR in {role}",
            ))

    blue_picks = [getattr(draft, f"blue_{r}") for r in ROLES if getattr(draft, f"blue_{r}")]
    red_picks = [getattr(draft, f"red_{r}") for r in ROLES if getattr(draft, f"red_{r}")]

    if len(blue_picks) >= 2:
        n_pairs = len(blue_picks) * (len(blue_picks) - 1) / 2
        for a, b in combinations(blue_picks, 2):
            syn = get_synergy_wr(a, b)
            impact = (syn - 0.5) * 0.20 / n_pairs
            blue_wr += impact
        factors.append(Factor(
            name="Blue team synergy",
            impact=sum(
                (get_synergy_wr(a, b) - 0.5) * 0.20 / n_pairs
                for a, b in combinations(blue_picks, 2)
            ),
            description=f"{len(blue_picks)} champions on Blue team",
        ))

    if len(red_picks) >= 2:
        n_pairs = len(red_picks) * (len(red_picks) - 1) / 2
        for a, b in combinations(red_picks, 2):
            syn = get_synergy_wr(a, b)
            impact = (syn - 0.5) * 0.20 / n_pairs
            red_wr += impact
        factors.append(Factor(
            name="Red team synergy",
            impact=-sum(
                (get_synergy_wr(a, b) - 0.5) * 0.20 / n_pairs
                for a, b in combinations(red_picks, 2)
            ),
            description=f"{len(red_picks)} champions on Red team",
        ))

    total = blue_wr + red_wr
    if total > 0:
        blue_wr /= total
    red_wr = 1.0 - blue_wr

    confidence = calculate_confidence(draft)

    return DraftAnalysis(
        blue_winrate=round(blue_wr, 4),
        red_winrate=round(red_wr, 4),
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
            predicted_winrate=wr,
            confidence=analysis.blue_confidence,
            factors=analysis.factors,
        ))
        setattr(draft, slot, None)

    return sorted(recommendations, key=lambda x: x.predicted_winrate, reverse=True)[:20]


def get_all_champions() -> list[ChampionStats]:
    from models import ChampionStats
    total_matches = tables["raw"]["gameid"].nunique()
    ban_rates = tables["ban_rates"]

    stats = []
    for _, row in tables["champion_role_wr"].iterrows():
        pickrate = row["games"] / total_matches if total_matches else 0
        stats.append(ChampionStats(
            name=row["champion"],
            role=row["role"],
            games=int(row["games"]),
            wins=int(row["wins"]),
            winrate=round(row["wr"], 4),
            pickrate=round(pickrate, 4),
            banrate=round(ban_rates.get(row["champion"], 0), 4),
        ))
    return stats


def get_champion_detail(name: str) -> list[ChampionStats]:
    from models import ChampionStats
    total_matches = tables["raw"]["gameid"].nunique()
    ban_rates = tables["ban_rates"]

    subset = tables["champion_role_wr"][tables["champion_role_wr"]["champion"] == name]
    stats = []
    for _, row in subset.iterrows():
        pickrate = row["games"] / total_matches if total_matches else 0
        stats.append(ChampionStats(
            name=row["champion"],
            role=row["role"],
            games=int(row["games"]),
            wins=int(row["wins"]),
            winrate=round(row["wr"], 4),
            pickrate=round(pickrate, 4),
            banrate=round(ban_rates.get(name, 0), 4),
        ))
    return stats


def get_counters(champion: str, role: str) -> list[dict]:
    subset = tables["matchup_wr"][
        (tables["matchup_wr"]["champ_a"] == champion)
        & (tables["matchup_wr"]["role"] == role)
        & (tables["matchup_wr"]["games"] >= 5)
    ]
    results = []
    for _, row in subset.iterrows():
        results.append({
            "champion": row["champ_b"],
            "games": int(row["games"]),
            "winrate_against": round(1.0 - row["wr"], 4),
            "description": f"{champion} wins {(1 - row['wr']):.1%} vs {row['champ_b']}",
        })
    return sorted(results, key=lambda x: x["winrate_against"], reverse=True)


def get_synergies(champion: str) -> list[dict]:
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
        results.append({
            "champion": partner,
            "games": int(row["games"]),
            "winrate_together": round(row["wr"], 4),
            "description": f"{champion} + {partner} win {row['wr']:.1%} together",
        })
    return sorted(results, key=lambda x: x["winrate_together"], reverse=True)


def get_teams() -> list[str]:
    return sorted(tables["raw"]["teamname"].dropna().unique().tolist())


def get_team_draft(team_name: str) -> list[dict]:
    df = tables["raw"][tables["raw"]["teamname"] == team_name]
    records = []
    for _, row in df.iterrows():
        records.append({
            "gameid": row["gameid"],
            "league": row["league"],
            "date": str(row["date"]),
            "side": row["side"],
            "opponent": row["opponent_name"],
            "result": "Win" if row["result"] == 1 else "Loss",
            "bans": [row[f"ban{i}"] for i in range(1, 6) if pd.notna(row.get(f"ban{i}"))],
            "picks": {
                "top": row.get("blue_top") if row["side"] == "Blue" else row.get("red_top"),
                "jng": row.get("blue_jng") if row["side"] == "Blue" else row.get("red_jng"),
                "mid": row.get("blue_mid") if row["side"] == "Blue" else row.get("red_mid"),
                "bot": row.get("blue_bot") if row["side"] == "Blue" else row.get("red_bot"),
                "sup": row.get("blue_sup") if row["side"] == "Blue" else row.get("red_sup"),
            },
        })
    return records


def get_leagues() -> list[str]:
    return sorted(tables["raw"]["league"].dropna().unique().tolist())


def get_patches() -> list[str]:
    return sorted(tables["raw"]["patch"].dropna().astype(str).unique().tolist())


def get_match(gameid: str) -> dict | None:
    df = tables["raw"][tables["raw"]["gameid"] == gameid]
    if df.empty:
        return None
    rows = df.to_dict("records")
    result = {
        "gameid": gameid,
        "league": rows[0]["league"],
        "date": str(rows[0]["date"]),
        "patch": str(rows[0]["patch"]),
        "blue_team": None,
        "red_team": None,
    }
    for row in rows:
        side = row["side"].lower()
        result[f"{side}_team"] = {
            "name": row["teamname"],
            "bans": [row[f"ban{i}"] for i in range(1, 6) if pd.notna(row.get(f"ban{i}"))],
            "picks": {
                "top": row.get(f"{side}_top"),
                "jng": row.get(f"{side}_jng"),
                "mid": row.get(f"{side}_mid"),
                "bot": row.get(f"{side}_bot"),
                "sup": row.get(f"{side}_sup"),
            },
            "result": "Win" if row["result"] == 1 else "Loss",
        }
    return result
