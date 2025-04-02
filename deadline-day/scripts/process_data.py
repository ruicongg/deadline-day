import pandas as pd
import numpy as np

REQUIRED_COLUMNS = [
    'Per90_% of Dribblers Tackled', 'Per90_Blocks', 'Per90_Challenges Lost', 'Per90_Clearances',
    'Per90_Dead-ball Passes', 'Per90_Dribblers Tackled', 'Per90_Dribbles Challenged', 'Per90_Errors',
    'Per90_Fouls Drawn', 'Per90_GCA (Dead-ball Pass)', 'Per90_GCA (Fouls Drawn)', 'Per90_GCA (Live-ball Pass)',
    'Per90_GCA (Take-On)', 'Per90_Goals/Shot on Target', 'Per90_Non-Penalty Goals - npxG',
    'Per90_Pass Completion %', 'Per90_Pass Completion % (Long)', 'Per90_Pass Completion % (Medium)',
    'Per90_Penalty Kicks Won', 'Per90_Progressive Carrying Distance', 'Per90_Progressive Passes Rec',
    'Per90_SCA (Defensive Action)', 'Per90_SCA (Shot)', 'Per90_Shots on Target %', 'Per90_Tackles',
    'Per90_Tackles (Def 3rd)', 'Per90_Through Balls', 'Per90_Throw-ins Taken', 'Per90_Tkl+Int',
    'Per90_Total Carrying Distance', 'Per90_Yellow Cards', 'Per90_npxG/Shot', 'age',
    'Finishing_Efficiency', 'Pass_Efficiency', 'Ball_Retention'
]

def preprocess_football_data(csv_path, feature_importance_threshold=0.005, return_scaler=False):
    outfield_df = pd.read_csv(csv_path)

    # Feature Engineering
    try:
        outfield_df["Finishing_Efficiency"] = outfield_df["Per90_Goals"] / outfield_df["Per90_Goals - xG"]
        outfield_df["Finishing_Efficiency"].fillna(0, inplace=True)
        outfield_df["Finishing_Efficiency"] = outfield_df["Finishing_Efficiency"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Goals - xG"], inplace=True)

        outfield_df["Assist_Efficiency"] = outfield_df["Per90_Assists"] / outfield_df["Per90_xA: Expected Assists"]
        outfield_df["Assist_Efficiency"].fillna(0, inplace=True)
        outfield_df["Assist_Efficiency"] = outfield_df["Assist_Efficiency"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_xA: Expected Assists"], inplace=True)

        outfield_df["Shot_Efficiency"] = outfield_df["Per90_Goals"] / outfield_df["Per90_Shots Total"]
        outfield_df["Shot_Efficiency"].fillna(0, inplace=True)
        outfield_df["Shot_Efficiency"] = outfield_df["Shot_Efficiency"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Shots Total"], inplace=True)

        outfield_df["Pass_Efficiency"] = outfield_df["Per90_Passes Completed"] / outfield_df["Per90_Passes Attempted"]
        outfield_df["Pass_Efficiency"].fillna(0, inplace=True)
        outfield_df["Pass_Efficiency"] = outfield_df["Pass_Efficiency"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Passes Attempted", "Per90_Passes Completed"], inplace=True)

        outfield_df["Possession_Lost_Ratio"] = (
            outfield_df["Per90_Dispossessed"] + outfield_df["Per90_Miscontrols"]
        ) / outfield_df["Per90_Touches"]
        outfield_df["Possession_Lost_Ratio"].fillna(0, inplace=True)
        outfield_df["Possession_Lost_Ratio"] = outfield_df["Possession_Lost_Ratio"].replace(np.inf, 0)

        outfield_df["Progressive_Play"] = outfield_df["Per90_Progressive Carries"] + outfield_df["Per90_Progressive Passes"]

        outfield_df["Ball_Retention"] = outfield_df["Per90_Successful Take-Ons"] / outfield_df["Per90_Take-Ons Attempted"]
        outfield_df["Ball_Retention"].fillna(0, inplace=True)
        outfield_df["Ball_Retention"] = outfield_df["Ball_Retention"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Take-Ons Attempted", "Per90_Successful Take-Ons"], inplace=True)

        outfield_df["Set_Piece_Involvement"] = (
            outfield_df["Per90_Corner Kicks"] +
            outfield_df["Per90_Passes from Free Kicks"] +
            outfield_df["Per90_Penalty Kicks Attempted"]
        )
        outfield_df.drop(columns=["Per90_Corner Kicks", "Per90_Passes from Free Kicks", "Per90_Penalty Kicks Attempted"], inplace=True)

    except KeyError as e:
        print(f"Warning: Could not create some engineered features. Missing column: {e}")
        print("Continuing with available features...")

    # Check for missing required columns
    available_columns = set(outfield_df.columns)
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in available_columns]

    if missing_columns:
        print("\n⚠️ Missing required columns:")
        for col in missing_columns:
            print(f" - {col}")
    else:
        print("\n✅ All required columns are present.")

    # Drop all columns not in REQUIRED_COLUMNS
    selected_columns = [col for col in REQUIRED_COLUMNS if col in outfield_df.columns]
    outfield_df = outfield_df[selected_columns]

    print(outfield_df)

    return outfield_df

# Example usage
if __name__ == "__main__":
    df = preprocess_football_data("test.csv")