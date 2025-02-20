# %%
# Import required libraries
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import StandardScaler

# Correlation
from scipy.stats import chi2_contingency
import seaborn as sns

# PCA
from sklearn.decomposition import PCA

# KMeans
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score,calinski_harabasz_score 

# KNN
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

# Random Forest
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from thefuzz import process
input = ["defenders_per90.csv", "midfielders_per90.csv", "forwards_per90.csv"]
output = ["defenders_processed.csv", "midfielders_processed.csv", "forwards_processed.csv"]
for each_file in range(len(input)):
# %%
    outfield_df = pd.read_csv("transformed_data/" + input[each_file])

    # print number of rows in outfield_df
    print(outfield_df.shape[0])


    # %% [markdown]
    # # Preprocessing

    # %%
    print(f"Number of outfield player records before dropping duplicates: {len(outfield_df)}")
    outfield_df = outfield_df.drop_duplicates()
    print(f"Number of outfield player records after dropping duplicates: {len(outfield_df)}")

    # %% [markdown]
    # Visualising and dropping rows where with players that didn't play enough for sample to be representative

    # %%
    plt.hist(outfield_df['BasedOnMinutes'].dropna(), bins=30, edgecolor='k')
    plt.xlabel('BasedOnMinutes')
    plt.ylabel('Frequency')
    plt.title('Distribution of BasedOnMinutes')
    plt.show()

    # %%
    # Dropping all entries with BasedOnMinutes less than 450 min, playing less than 5 games
    print(f"Number of outfield outfield records before filtering: {len(outfield_df)}")
    outfield_df = outfield_df[outfield_df['BasedOnMinutes'] >= 450]
    print(f"Number of outfield outfield records after filtering: {len(outfield_df)}")

    # %% [markdown]
    # Dropping rows with "Last 365 Days Men's Big 5 Leagues"

    # %%
    # Drop rows where scouting_period is "Last 365 Days Men's Big 5 Leagues"
    outfield_df = outfield_df[outfield_df['scouting_period'] != "Last 365 Days Men's Big 5 Leagues"]

    # %% [markdown]
    # Dropping per 90 data (not needed any more since split dataset into per90 and percentile, also hard to average percentile)

    # %%
    # # drop per90

    # # Initial number of columns
    # initial_column_count = outfield_df.shape[1]

    # # Drop columns with "Per90" in their name
    # columns_to_drop = [col for col in outfield_df.columns if 'Per90' in col]
    # outfield_df = outfield_df.drop(columns=columns_to_drop)

    # # Final number of columns
    # final_column_count = outfield_df.shape[1]
    # columns_dropped = initial_column_count - final_column_count

    # print(f"Number of columns before dropping 'Per90': {initial_column_count}")
    # print(f"Number of columns after dropping 'Per90': {final_column_count}")
    # print(f"Number of columns dropped: {columns_dropped}")

    # %% [markdown]
    # Dropping Percentile data 

    # %%
    print(f"Number of outfield player records before dropping Percentile: {outfield_df.shape[1]}")
    columns_to_drop = [col for col in outfield_df.columns if 'Percentile' in col]
    outfield_df = outfield_df.drop(columns=columns_to_drop)
    print(f"Number of outfield player records after dropping Percentile: {outfield_df.shape[1]}")

    # %% [markdown]
    # Handling na values

    # %%
    null_rows = outfield_df[outfield_df.isnull().any(axis=1)]
    null_rows.to_excel('transformed_data/null_rows.xlsx', index=False)

    # %%
    # na_columns_goal_related = ['Percentile_Goals/Shot on Target', 
    #                            'Percentile_npxG/Shot', 
    #                            'Percentile_Average Shot Distance', 
    #                            'Percentile_Goals/Shot', 
    #                            'Percentile_Shots on Target %']
    # na_columns_dribble_related = ['Percentile_Successful Take-On %',
    #                               'Percentile_Tackled During Take-On Percentage']
    # na_columns_others = ['Percentile_% of Dribblers Tackled',
    #                      'Percentile_% of Aerials Won',
    #                      'Percentile_Pass Completion % (Long)']
    # # Fill missing values with 0 as corresponding player is not involved in those actions, suggesting they are not good at it.
    # outfield_df[na_columns_goal_related] = outfield_df[na_columns_goal_related].fillna(0)
    # outfield_df[na_columns_dribble_related] = outfield_df[na_columns_dribble_related].fillna(0)
    # outfield_df[na_columns_others] = outfield_df[na_columns_others].fillna(0)

    # %%
    # If Per90 is not dropped
    na_columns_goal_related_per90 = ['Per90_Goals/Shot on Target', 
                                    'Per90_npxG/Shot', 
                                    'Per90_Average Shot Distance', 
                                    'Per90_Goals/Shot', 
                                    'Per90_Shots on Target %']
    na_columns_dribble_related_per90 = ['Per90_Successful Take-On %',
                                        'Per90_Tackled During Take-On Percentage']
    na_columns_others = ['Per90_% of Dribblers Tackled',
                        'Per90_% of Aerials Won',
                        'Per90_Pass Completion % (Long)']
    def get_existing_columns(df, *column_lists):
        existing_cols = []
        for col_list in column_lists:
            existing_cols.extend([col for col in col_list if col in df.columns])
        return existing_cols

    # Get all existing columns from the three lists
    existing_columns = get_existing_columns(outfield_df, 
                                            na_columns_goal_related_per90, 
                                            na_columns_dribble_related_per90, 
                                            na_columns_others)

    outfield_df[existing_columns] = outfield_df[existing_columns].fillna(0)

    # %%
    print(f"Number of rows with na values: {len(outfield_df[outfield_df.isnull().any(axis=1)])}")

    # %% [markdown]
    # Feature Scaling (Z-score, min-max, maxAbs etc.)

    # %% [markdown]
    # Feature Engineering

    # %%
    # Compute the Goals per Expected Goals Ratio
    outfield_df["Finishing_Efficiency"] = outfield_df["Per90_Goals"] / outfield_df["Per90_Goals - xG"]

    # Handle cases where xG is zero (avoid division by zero)
    outfield_df["Finishing_Efficiency"].fillna(0, inplace=True)
    outfield_df["Finishing_Efficiency"] = outfield_df["Finishing_Efficiency"].replace(np.inf, 0)

    # Drop Per90_Goals - xG
    outfield_df = outfield_df.drop(columns=["Per90_Goals - xG"])

    # Compute the Assists per Expected Assists Ratio
    outfield_df["Assist_Efficiency"] = outfield_df["Per90_Assists"] / outfield_df["Per90_xA: Expected Assists"]
    outfield_df["Assist_Efficiency"].fillna(0, inplace=True)
    outfield_df["Assist_Efficiency"] = outfield_df["Assist_Efficiency"].replace(np.inf, 0)
    outfield_df = outfield_df.drop(columns=["Per90_xA: Expected Assists"])

    # %% [markdown]
    # Combining rows to ensure that one entry is tagged to only one unique player

    # %%
    print(outfield_df.dtypes)

    # %%
    # Drop non-numeric column "scouting_period"
    outfield_df = outfield_df.drop(columns=["scouting_period"], errors="ignore")

    # Define numeric columns excluding categorical ones
    numeric_cols = [col for col in outfield_df.columns if col not in ['Player', 'Versus', 'BasedOnMinutes']]

    # Compute weighted averages for numeric stats
    weighted_avg_df = outfield_df.groupby("Player").apply(
        lambda group: pd.Series(
            {col: np.average(group[col], weights=group["BasedOnMinutes"]) for col in numeric_cols}
        )
    ).reset_index()

    # Drop "BasedOnMinutes" since it's no longer needed
    outfield_df = weighted_avg_df.drop(columns=["BasedOnMinutes"], errors="ignore")

    outfield_df.head()

    # %% [markdown]
    # Merge with age_data

    # %%

    age_df = pd.read_csv("data/age_data.csv")

    for name in outfield_df['Player']:
        matched_name, score, _ = process.extractOne(name, age_df['Player'])

        if score >= 70:
            outfield_df['Player'] = outfield_df['Player'].replace(name, matched_name)

    outfield_df = outfield_df.merge(
        age_df[['Player', 'age']], 
        on="Player", 
        how="left"
    )

    print(f"Number of na values in Age: {outfield_df['age'].isna().sum()}")
    outfield_df['age'].fillna(0, inplace=True)
    print(f"Number of na values in Age after filling: {outfield_df['age'].isna().sum()}")

    outfield_df.to_csv("preprocessed_data/outfield_processed.csv", index=False)

    print("Merging completed successfully!")

    # %% [markdown]
    # Finding correlation between features 

    # %%
    # Function to compute Cramér's V
    def cramers_v(cat_variable, num_variable):
        contingency_table = pd.crosstab(outfield_df[cat_variable], pd.qcut(outfield_df[num_variable], q=4))
        chi2 = chi2_contingency(contingency_table)[0]
        n = outfield_df.shape[0]
        return np.sqrt(chi2 / (n * (min(contingency_table.shape) - 1)))

    # Identify categorical and numerical columns
    categorical_cols = []
    non_numeric_cols = ["Player"] + categorical_cols
    numerical_cols = outfield_df.select_dtypes(include=["float64", "int64"]).columns

    # Drop non-numeric variables before computing numerical correlations
    numerical_df = outfield_df.drop(columns=non_numeric_cols, errors="ignore")

    # Compute Pearson correlation for numerical variables
    numerical_corr_matrix = numerical_df.corr()

    # Initialize Cramér’s V matrix for categorical-numerical correlations
    cramers_matrix = pd.DataFrame(index=categorical_cols, columns=numerical_cols)

    # Compute Cramér's V for categorical-numerical relationships
    for cat_col in categorical_cols:
        for num_col in numerical_cols:
            if cat_col != num_col:
                cramers_matrix.loc[cat_col, num_col] = cramers_v(cat_col, num_col)

    # Convert Cramér’s V values to float
    cramers_matrix = cramers_matrix.astype(float)

    # Merge Pearson correlation with Cramér’s V correlation
    full_correlation_matrix = numerical_corr_matrix.copy()

    for cat_col in categorical_cols:
        for num_col in numerical_cols:
            full_correlation_matrix.loc[cat_col, num_col] = cramers_matrix.loc[cat_col, num_col]

    # Convert final matrix to float for heatmap
    full_correlation_matrix = full_correlation_matrix.astype(float)


    # %%
    # Set correlation threshold 
    correlation_threshold = 0.9

    # Compute the absolute correlation matrix
    corr_matrix = full_correlation_matrix.abs()

    # Create a set to hold the features to remove
    features_to_remove = set()

    # Iterate through correlation matrix and identify features to drop
    for i in range(len(corr_matrix.columns)):
        for j in range(i):
            if corr_matrix.iloc[i, j] > correlation_threshold:  # If correlation is above threshold
                colname = corr_matrix.columns[i]  # Get feature name
                features_to_remove.add(colname)  # Add it to the removal list

    # Drop the identified features
    outfield_df_reduced = outfield_df.drop(columns=features_to_remove, errors="ignore")

    # Save the cleaned dataset
    outfield_df_reduced.to_csv("transformed_data/outfield_stats_cleaned.csv", index=False)

    print(f"Removed {len(features_to_remove)} highly correlated features.")
    print(f"Remaining features: {outfield_df_reduced.shape[1]}")

    # %% [markdown]
    # Reducing Dimension

    # %%
    # Specify categorical columns to keep
    non_statistical_data = ["Player"]  

    # Separate categorical and numerical features
    kept_features_df = outfield_df[non_statistical_data].reset_index(drop=True)  # Reset index for safe merge
    features = outfield_df.drop(columns=non_statistical_data)  # Drop categorical columns for PCA

    # Print the number of features before PCA
    print("Number of features before PCA:", features.shape[1])

    # Standardize numerical features before applying PCA
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    # Apply PCA to retain 95% variance
    pca = PCA(n_components=0.95)
    X_pca = pca.fit_transform(X_scaled)

    # Convert PCA output back to DataFrame
    pca_df = pd.DataFrame(X_pca, index=outfield_df.index)

    # Name PCA columns properly
    pca_df.columns = [f'PCA_{i+1}' for i in range(pca_df.shape[1])]

    # Concatenate categorical columns with PCA-transformed numerical data
    outfield_df = pd.concat([kept_features_df, pca_df.reset_index(drop=True)], axis=1)

    # Print the number of features after PCA
    print("Number of features after PCA:", pca_df.shape[1])

    # Plot PCA explained variance
    plt.plot(range(1, len(pca.explained_variance_ratio_)+1), pca.explained_variance_ratio_.cumsum(), marker='o')
    plt.xlabel('Number of Components')
    plt.ylabel('Cumulative Explained Variance')
    plt.title("PCA Explained Variance")
    plt.show()

    # %% [markdown]
    # Merge data with valuation

    # %%

    # Load player market valuations data
    valuations_df = pd.read_csv("data/Premier_League_Player_Valuations_2019_2024.csv")

    # Rename 'player_name' to 'Player'
    valuations_df.rename(columns={"player_name": "Player"}, inplace=True)

    # Filter only rows where season_start_year is 2024
    valuations_2024_df = valuations_df[valuations_df['season_start_year'] == 2024]

    # Change 'Player' value in outfield_df to that in valuations_2024_df if fuzzy matching
    for name in outfield_df['Player']:
        matched_name, score, _ = process.extractOne(name, valuations_2024_df['Player'])

        if score >= 70:
            # replace name with best_match
            outfield_df['Player'] = outfield_df['Player'].replace(name, matched_name)

    # Merge only player_market_value_euro for 2024 season
    outfield_df = outfield_df.merge(
        valuations_2024_df[['Player', 'player_market_value_euro']], 
        on="Player", 
        how="left"
    )

    # Print number of na values in player_market_value_euro
    print(f"Number of na values in player_market_value_euro: {outfield_df['player_market_value_euro'].isna().sum()}")
    # Fill na values with 0
    outfield_df['player_market_value_euro'].fillna(0, inplace=True)
    print(f"Number of na values in player_market_value_euro after filling: {outfield_df['player_market_value_euro'].isna().sum()}")
    # Save the processed file
    outfield_df.to_csv("preprocessed_data/" + output[each_file], index=False)

    print("Merging completed successfully!")

    # %% [markdown]
    # Encoding Categorical Variables (all categorical were dropped as we are manually separating by position)

    # %%
    # print("Columns before encoding:", outfield_df.columns)
    # outfield_df = pd.get_dummies(outfield_df, columns=['Versus', 'scouting_period'])
    # print("Columns after encoding:", outfield_df.columns)

    # %% [markdown]
    # Others (Removing outliers)

    # %% [markdown]
    # Merging dataset with valuation

    # %%



