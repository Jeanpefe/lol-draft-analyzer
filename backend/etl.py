import os
import pandas as pd

INPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "2026_LoL_esports_match_data_from_OraclesElixir.csv")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "draft_data.csv")

EXCLUDE_COLS = {
    "url", "participantid", "position", "teamid",
    "playername", "playerid", "champion",
    "total cs",
}


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    df = pd.read_csv(INPUT_PATH, quotechar='"', low_memory=False)
    print(f"Raw rows: {len(df)}")

    # --- Player pivoting (rows 1-10) ---
    df_players = df[df["participantid"].isin(range(1, 11))].copy()

    blue_roles = df_players[df_players["side"] == "Blue"]
    red_roles = df_players[df_players["side"] == "Red"]

    blue_champ_pivoted = blue_roles.pivot_table(
        index="gameid", columns="position", values="champion", aggfunc="first"
    )
    blue_champ_pivoted.columns = [f"blue_{col}" for col in blue_champ_pivoted.columns]

    blue_player_pivoted = blue_roles.pivot_table(
        index="gameid", columns="position", values="playername", aggfunc="first"
    )
    blue_player_pivoted.columns = [f"blue_{col}_player" for col in blue_player_pivoted.columns]

    red_champ_pivoted = red_roles.pivot_table(
        index="gameid", columns="position", values="champion", aggfunc="first"
    )
    red_champ_pivoted.columns = [f"red_{col}" for col in red_champ_pivoted.columns]

    red_player_pivoted = red_roles.pivot_table(
        index="gameid", columns="position", values="playername", aggfunc="first"
    )
    red_player_pivoted.columns = [f"red_{col}_player" for col in red_player_pivoted.columns]

    # Pivot per-player stats
    PLAYER_STATS = ["kills", "deaths", "assists", "damagetochampions", "totalgold", "total cs", "visionscore"]

    def pivot_player_stat(side_df, stat, side_prefix):
        piv = side_df.pivot_table(index="gameid", columns="position", values=stat, aggfunc="first")
        piv.columns = [f"{side_prefix}_{c}_{stat}" for c in piv.columns]
        return piv

    blue_stat_pivots = [pivot_player_stat(blue_roles, s, "blue") for s in PLAYER_STATS]
    red_stat_pivots = [pivot_player_stat(red_roles, s, "red") for s in PLAYER_STATS]

    # --- Team rows (participantid 100/200): keep ALL columns ---
    df_teams = df[df["participantid"].isin([100, 200])].copy()
    print(f"Team rows (participantid 100/200): {len(df_teams)}")

    # Drop excluded columns
    cols_to_drop = [c for c in EXCLUDE_COLS if c in df_teams.columns]
    df_teams = df_teams.drop(columns=cols_to_drop)

    # Merge player champions and player names
    df_teams = df_teams.merge(blue_champ_pivoted, on="gameid", how="left")
    df_teams = df_teams.merge(red_champ_pivoted, on="gameid", how="left")
    df_teams = df_teams.merge(blue_player_pivoted, on="gameid", how="left")
    df_teams = df_teams.merge(red_player_pivoted, on="gameid", how="left")

    # Merge per-player stats
    for piv in blue_stat_pivots:
        df_teams = df_teams.merge(piv, on="gameid", how="left")
    for piv in red_stat_pivots:
        df_teams = df_teams.merge(piv, on="gameid", how="left")

    # Generate opponent_name and opponent_side
    df_teams["opponent_name"] = df_teams.groupby("gameid")["teamname"].transform(
        lambda x: x.iloc[::-1].values
    )
    df_teams["opponent_side"] = df_teams["side"].map({"Blue": "Red", "Red": "Blue"})

    # Column order: metadata first, then stats, then player data at the end
    metadata = [
        "gameid", "league", "year", "split", "playoffs", "date", "game", "patch",
        "side", "teamname", "firstPick",
    ]
    bans = [f"ban{i}" for i in range(1, 6)]
    picks = [f"pick{i}" for i in range(1, 6)]
    result_stats = ["result", "gamelength", "datacompleteness"]
    combat = [
        "kills", "deaths", "assists", "teamkills", "teamdeaths",
        "doublekills", "triplekills", "quadrakills", "pentakills",
        "firstblood",
    ]
    tempo = ["team kpm", "ckpm"]
    objectives = [
        "firstdragon", "dragons", "opp_dragons",
        "elementaldrakes", "opp_elementaldrakes",
        "infernals", "mountains", "clouds", "oceans", "chemtechs", "hextechs",
        "elders", "opp_elders",
        "firstherald", "heralds", "opp_heralds",
        "void_grubs", "opp_void_grubs",
        "firstbaron", "barons", "opp_barons",
        "atakhans", "opp_atakhans",
    ]
    towers_structures = [
        "firsttower", "towers", "opp_towers",
        "firstmidtower", "firsttothreetowers",
        "turretplates", "opp_turretplates",
        "inhibitors", "opp_inhibitors",
    ]
    damage = [
        "damagetochampions", "dpm",
        "damagetakenperminute", "damagemitigatedperminute",
        "damagetotowers",
    ]
    vision = [
        "wardsplaced", "wpm", "wardskilled", "wcpm",
        "controlwardsbought", "visionscore", "vspm",
    ]
    economy = [
        "totalgold", "earnedgold", "earned gpm",
        "goldspent", "gspd",
    ]
    cs_stats = ["minionkills", "monsterkills", "cspm"]
    early_game = []
    for t in [10, 15, 20, 25]:
        early_game += [
            f"goldat{t}", f"xpat{t}", f"csat{t}",
            f"opp_goldat{t}", f"opp_xpat{t}", f"opp_csat{t}",
            f"golddiffat{t}", f"xpdiffat{t}", f"csdiffat{t}",
            f"killsat{t}", f"assistsat{t}", f"deathsat{t}",
            f"opp_killsat{t}", f"opp_assistsat{t}", f"opp_deathsat{t}",
        ]

    opponent = ["opponent_name", "opponent_side"]
    blue_champs = [f"blue_{r}" for r in ["top", "jng", "mid", "bot", "sup"]]
    red_champs = [f"red_{r}" for r in ["top", "jng", "mid", "bot", "sup"]]
    blue_players = [f"blue_{r}_player" for r in ["top", "jng", "mid", "bot", "sup"]]
    red_players = [f"red_{r}_player" for r in ["top", "jng", "mid", "bot", "sup"]]
    blue_player_stats = [f"blue_{r}_{s}" for r in ["top", "jng", "mid", "bot", "sup"] for s in PLAYER_STATS]
    red_player_stats = [f"red_{r}_{s}" for r in ["top", "jng", "mid", "bot", "sup"] for s in PLAYER_STATS]

    ordered_groups = [
        metadata, bans, picks, result_stats, combat, tempo,
        objectives, towers_structures, damage, vision, economy, cs_stats,
        early_game, opponent, blue_champs, red_champs, blue_players, red_players,
        blue_player_stats, red_player_stats,
    ]

    # Flatten and keep only columns that exist
    all_ordered = []
    seen = set()
    for group in ordered_groups:
        for col in group:
            if col in df_teams.columns and col not in seen:
                all_ordered.append(col)
                seen.add(col)

    # Append any remaining columns not yet ordered
    for col in df_teams.columns:
        if col not in seen:
            all_ordered.append(col)
            seen.add(col)

    df_teams = df_teams[all_ordered]

    # Save
    df_teams.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSaved to {OUTPUT_PATH}")
    print(f"Total columns: {len(df_teams.columns)}")

    # Validations
    df = df_teams
    print(f"\nTotal matches: {df['gameid'].nunique()}")
    print(f"Total rows: {len(df)}")
    print(f"Rows per match: {df.groupby('gameid').size().value_counts().to_dict()}")
    print(f"Leagues: {df['league'].nunique()}")
    print(f"Teams: {df['teamname'].nunique()}")
    print(f"Complete: {(df['datacompleteness'] == 'complete').sum()}")
    print(f"Partial: {(df['datacompleteness'] == 'partial').sum()}")

    assert df.groupby("gameid").size().eq(2).all(), "ERROR: Some matches don't have exactly 2 rows"
    assert df[["blue_top", "blue_jng", "blue_mid", "blue_bot", "blue_sup"]].notna().all().all(), "ERROR: Missing blue player champions"
    assert df[["red_top", "red_jng", "red_mid", "red_bot", "red_sup"]].notna().all().all(), "ERROR: Missing red player champions"
    assert df[["blue_top_player", "blue_jng_player", "blue_mid_player", "blue_bot_player", "blue_sup_player"]].notna().all().all(), "ERROR: Missing blue player names"
    assert df[["red_top_player", "red_jng_player", "red_mid_player", "red_bot_player", "red_sup_player"]].notna().all().all(), "ERROR: Missing red player names"
    print("\nAll validations passed.")


if __name__ == "__main__":
    main()
