import os
import pandas as pd

INPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "2026_LoL_esports_match_data_from_OraclesElixir.csv")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "draft_data.csv")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    df = pd.read_csv(INPUT_PATH, quotechar='"')
    print(f"Raw rows: {len(df)}")

    # --- Player pivoting (rows 1-10) ---
    df_players = df[df["participantid"].isin(range(1, 11))].copy()

    blue_roles = df_players[df_players["side"] == "Blue"]
    red_roles = df_players[df_players["side"] == "Red"]

    blue_pivoted = blue_roles.pivot_table(
        index="gameid", columns="position", values="champion", aggfunc="first"
    )
    blue_pivoted.columns = [f"blue_{col}" for col in blue_pivoted.columns]

    red_pivoted = red_roles.pivot_table(
        index="gameid", columns="position", values="champion", aggfunc="first"
    )
    red_pivoted.columns = [f"red_{col}" for col in red_pivoted.columns]

    # --- Team rows (participantid 100/200) ---
    df_teams = df[df["participantid"].isin([100, 200])].copy()
    print(f"Team rows (participantid 100/200): {len(df_teams)}")

    output_cols = [
        "gameid", "league", "year", "split", "playoffs", "date", "game", "patch",
        "side", "teamname", "teamid", "firstPick",
        "ban1", "ban2", "ban3", "ban4", "ban5",
        "pick1", "pick2", "pick3", "pick4", "pick5",
        "result", "gamelength", "datacompleteness",
    ]
    df_teams = df_teams[output_cols].copy()

    # Merge player champions
    df_teams = df_teams.merge(blue_pivoted, on="gameid", how="left")
    df_teams = df_teams.merge(red_pivoted, on="gameid", how="left")

    # Generate opponent_name and opponent_side
    df_teams["opponent_name"] = df_teams.groupby("gameid")["teamname"].transform(
        lambda x: x.iloc[::-1].values
    )
    df_teams["opponent_side"] = df_teams["side"].map({"Blue": "Red", "Red": "Blue"})

    # Final column order (37 columns)
    final_cols = [
        "gameid", "league", "year", "split", "playoffs", "date", "game", "patch",
        "side", "teamname", "teamid", "firstPick",
        "ban1", "ban2", "ban3", "ban4", "ban5",
        "pick1", "pick2", "pick3", "pick4", "pick5",
        "result", "gamelength", "datacompleteness",
        "opponent_name", "opponent_side",
        "blue_top", "blue_jng", "blue_mid", "blue_bot", "blue_sup",
        "red_top", "red_jng", "red_mid", "red_bot", "red_sup",
    ]
    df_teams = df_teams[final_cols]

    # Save
    df_teams.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSaved to {OUTPUT_PATH}")

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
    print("\nAll validations passed.")


if __name__ == "__main__":
    main()
