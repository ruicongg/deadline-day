import os
import pandas as pd

base_path = "big-5-age-valuation-data"
input_files = [] 
# Get all league folders
for file in os.listdir(base_path):
    if file.endswith('.csv'):
        input_files.append(os.path.join(base_path, file))

# Create an empty list to store all dataframes
all_dfs = []

for file in input_files:
    df = pd.read_csv(file)
    # Select only the required columns
    df = df[['player_name', 'player_age', 'player_market_value_euro']]
    all_dfs.append(df)

# Combine all dataframes
combined_df = pd.concat(all_dfs, ignore_index=True)

# Rename columns to match the random forest model
combined_df = combined_df.rename(columns={
    'player_name': 'Player',
    'player_age': 'age',
    'player_market_value_euro': 'player_market_value_euro'  # Keep this as is since it's used in the model
})

# Save to a new CSV file
combined_df.to_csv('combined_data/age-valuation.csv', index=False)
print(f"Created combined_data/age-valuation.csv with {len(combined_df)} rows")
