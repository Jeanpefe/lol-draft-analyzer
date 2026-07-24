import os
import pandas as pd

INPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "2026_LoL_esports_match_data_from_OraclesElixir.csv")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "draft_data.csv")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    df = pd.read_csv(INPUT_PATH, quotechar='"')
    print(f"Raw rows: {len(df)}")

    # Filter team rows only
    df = df[df["participantid"].isin([100, 200])].copy()
    print(f"Team rows (participantid 100/200): {len(df)}")

    # Select output columns
    output_cols = [
        "gameid", "league", "year", "split", "playoffs", "date", "game", "patch",
        "side", "teamname", "teamid", "firstPick",
        "ban1", "ban2", "ban3", "ban4", "ban5",
        "pick1", "pick2", "pick3", "pick4", "pick5",
        "result", "gamelength", "datacompleteness",
    ]
    df = df[output_cols].copy()

    # Generate opponent_name and opponent_side
    df["opponent_name"] = df.groupby("gameid")["teamname"].transform(
        lambda x: x.iloc[::-1].values
    )
    df["opponent_side"] = df["side"].map({"Blue": "Red", "Red": "Blue"})

    # Final column order
    final_cols = [
        "gameid", "league", "year", "split", "playoffs", "date", "game", "patch",
        "side", "teamname", "teamid", "firstPick",
        "ban1", "ban2", "ban3", "ban4", "ban5",
        "pick1", "pick2", "pick3", "pick4", "pick5",
        "result", "gamelength", "datacompleteness",
        "opponent_name", "opponent_side",
    ]
    df = df[final_cols]

    # Save
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSaved to {OUTPUT_PATH}")

    # Validations
    print(f"\nTotal matches: {df['gameid'].nunique()}")
    print(f"Total rows: {len(df)}")
    print(f"Rows per match: {df.groupby('gameid').size().value_counts().to_dict()}")
    print(f"Leagues: {df['league'].nunique()}")
    print(f"Teams: {df['teamname'].nunique()}")
    print(f"Complete: {(df['datacompleteness'] == 'complete').sum()}")
    print(f"Partial: {(df['datacompleteness'] == 'partial').sum()}")

    assert df.groupby("gameid").size().eq(2).all(), "ERROR: Some matches don't have exactly 2 rows"
    print("\nAll validations passed.")


if __name__ == "__main__":
    main()
