import pandas as pd
import numpy as np
# from sklearn.preprocessing import StandardScaler
# from sklearn.ensemble import RandomForestRegressor

def preprocess_football_data(csv_path, feature_importance_threshold=0.005, return_scaler=False):
    """
    Preprocess football statistics data with feature engineering and standardization.
    
    Parameters:
    -----------
    csv_path : str
        Path to the input CSV file
    feature_importance_threshold : float, optional (default=0.005)
        Threshold for feature importance below which features will be dropped
    return_scaler : bool, optional (default=False)
        Whether to return the fitted scaler for preprocessing test data
    
    Returns:
    --------
    pandas.DataFrame or tuple
        Preprocessed DataFrame with engineered features
        If return_scaler=True, returns (preprocessed_df, scaler)
    """
    
    # Load the dataset
    outfield_df = pd.read_csv(csv_path)
    
    
    # Feature Engineering
    try:
        # Finishing Efficiency
        outfield_df["Finishing_Efficiency"] = outfield_df["Per90_Goals"] / outfield_df["Per90_Goals - xG"]
        outfield_df["Finishing_Efficiency"].fillna(0, inplace=True)
        outfield_df["Finishing_Efficiency"] = outfield_df["Finishing_Efficiency"].replace(np.inf, 0)
        outfield_df = outfield_df.drop(columns=["Per90_Goals - xG"])

        # Assist Efficiency
        outfield_df["Assist_Efficiency"] = outfield_df["Per90_Assists"] / outfield_df["Per90_xA: Expected Assists"]
        outfield_df["Assist_Efficiency"].fillna(0, inplace=True)
        outfield_df["Assist_Efficiency"] = outfield_df["Assist_Efficiency"].replace(np.inf, 0)
        outfield_df = outfield_df.drop(columns=["Per90_xA: Expected Assists"])

        # Shot Efficiency
        outfield_df["Shot_Efficiency"] = outfield_df["Per90_Goals"] / outfield_df["Per90_Shots Total"]
        outfield_df["Shot_Efficiency"].fillna(0, inplace=True)
        outfield_df["Shot_Efficiency"] = outfield_df["Shot_Efficiency"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Shots Total"], inplace=True)

        # Pass Efficiency
        outfield_df["Pass_Efficiency"] = outfield_df["Per90_Passes Completed"] / outfield_df["Per90_Passes Attempted"]
        outfield_df["Pass_Efficiency"].fillna(0, inplace=True)
        outfield_df["Pass_Efficiency"] = outfield_df["Pass_Efficiency"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Passes Attempted", "Per90_Passes Completed"], inplace=True)

        # Possession Lost Ratio
        outfield_df["Possession_Lost_Ratio"] = (outfield_df["Per90_Dispossessed"] + outfield_df["Per90_Miscontrols"]) / outfield_df["Per90_Touches"]
        outfield_df["Possession_Lost_Ratio"].fillna(0, inplace=True)
        outfield_df["Possession_Lost_Ratio"] = outfield_df["Possession_Lost_Ratio"].replace(np.inf, 0)

        # Progressive Play
        outfield_df["Progressive_Play"] = outfield_df["Per90_Progressive Carries"] + outfield_df["Per90_Progressive Passes"]

        # Ball Retention
        outfield_df["Ball_Retention"] = outfield_df["Per90_Successful Take-Ons"] / outfield_df["Per90_Take-Ons Attempted"]
        outfield_df["Ball_Retention"].fillna(0, inplace=True)
        outfield_df["Ball_Retention"] = outfield_df["Ball_Retention"].replace(np.inf, 0)
        outfield_df.drop(columns=["Per90_Take-Ons Attempted", "Per90_Successful Take-Ons"], inplace=True)

        # Set Piece Involvement
        outfield_df["Set_Piece_Involvement"] = (
            outfield_df["Per90_Corner Kicks"] +
            outfield_df["Per90_Passes from Free Kicks"] +
            outfield_df["Per90_Penalty Kicks Attempted"]
        )
        outfield_df.drop(columns=["Per90_Corner Kicks", "Per90_Passes from Free Kicks", "Per90_Penalty Kicks Attempted"], inplace=True)

    except KeyError as e:
        print(f"Warning: Could not create some engineered features. Missing column: {e}")
        print("Continuing with available features...")

    
    X = outfield_df.drop(columns=["player_market_value_euro", "Player"])
    
    print("---------")
    print(X.columns.tolist())
    
    # # Feature Importance Analysis
    # try:
    #     X = outfield_df.drop(columns=["player_market_value_euro", "Player"])
    #     y = outfield_df["player_market_value_euro"]

    #     model = RandomForestRegressor(n_estimators=100, random_state=42)
    #     model.fit(X, y)

    #     # Get feature importance and drop low importance features
    #     feature_importance = pd.Series(model.feature_importances_, index=X.columns)
    #     drop_features = feature_importance[feature_importance < feature_importance_threshold].index
    #     common_columns_to_drop = [col for col in drop_features if col in outfield_df.columns]
    #     outfield_df = outfield_df.drop(columns=common_columns_to_drop)

    # except KeyError as e:
    #     print(f"Warning: Could not perform feature importance analysis. Missing column: {e}")

    # # Standardize numerical features
    # try:
    #     scaler = StandardScaler()
    #     statistical_cols = [col for col in outfield_df.columns if col not in ['Player', 'player_market_value_euro']]
    #     outfield_df[statistical_cols] = scaler.fit_transform(outfield_df[statistical_cols])
        
    #     if return_scaler:
    #         return outfield_df, scaler
            
    # except Exception as e:
    #     print(f"Warning: Could not standardize features. Error: {e}")
    #     if return_scaler:
    #         return outfield_df, None

    return outfield_df

# Example usage
if __name__ == "__main__":
    # Basic usage
    df = preprocess_football_data("test.csv")
    
    # Usage with scaler for consistent preprocessing
    # df, scaler = preprocess_football_data("preprocessed_data/outfield_unique.csv", return_scaler=True)
    
    # If you need to preprocess new data later:
    # new_data = pd.read_csv("new_data.csv")
    # statistical_cols = [col for col in new_data.columns if col not in ['Player', 'player_market_value_euro']]
    # new_data[statistical_cols] = scaler.transform(new_data[statistical_cols]) 