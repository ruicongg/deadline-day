import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Create a temporary directory to store the uploaded file
    const tempDir = path.join(os.tmpdir(), "player-stats-" + Date.now())
    fs.mkdirSync(tempDir, { recursive: true })

    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Save the file to the temporary directory
    const filePath = path.join(tempDir, "player-stats.csv")
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, fileBuffer)

    // Create a Python script that handles preprocessing and prediction
    const scriptPath = path.join(tempDir, "predict.py")

    // Write the Python script
    fs.writeFileSync(
      scriptPath,
      `
import pandas as pd
import numpy as np
import pickle
import sys
import json
import os
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor

# Define the preprocessing function
def preprocess_football_data(file_path):
    """
    Preprocess football player data for the valuation model.
    
    Args:
        file_path: Path to the CSV file containing player data
        
    Returns:
        DataFrame with preprocessed data ready for model prediction
    """
    try:
        # Read the CSV file
        df = pd.read_csv(file_path, low_memory=False)
        print(f"Original data shape: {df.shape}")
        
        # List of required columns for the model
        required_columns = [
            'Per90_% of Dribblers Tackled', 'Per90_Blocks', 'Per90_Challenges Lost', 
            'Per90_Clearances', 'Per90_Dead-ball Passes', 'Per90_Dribblers Tackled', 
            'Per90_Dribbles Challenged', 'Per90_Errors', 'Per90_Fouls Drawn', 
            'Per90_GCA (Dead-ball Pass)', 'Per90_GCA (Fouls Drawn)', 'Per90_GCA (Live-ball Pass)', 
            'Per90_GCA (Take-On)', 'Per90_Goals/Shot on Target', 'Per90_Non-Penalty Goals - npxG', 
            'Per90_Pass Completion %', 'Per90_Pass Completion % (Long)', 'Per90_Pass Completion % (Medium)', 
            'Per90_Penalty Kicks Won', 'Per90_Progressive Carrying Distance', 'Per90_Progressive Passes Rec', 
            'Per90_SCA (Defensive Action)', 'Per90_SCA (Shot)', 'Per90_Shots on Target %', 
            'Per90_Tackles', 'Per90_Tackles (Def 3rd)', 'Per90_Through Balls', 
            'Per90_Throw-ins Taken', 'Per90_Tkl+Int', 'Per90_Total Carrying Distance', 
            'Per90_Yellow Cards', 'Per90_npxG/Shot', 'age', 'Finishing_Efficiency', 
            'Pass_Efficiency', 'Ball_Retention'
        ]
        
        # Check which required columns are missing
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"Warning: Missing columns: {missing_columns}")
            # Add missing columns with zeros
            for col in missing_columns:
                df[col] = 0
        
        # Ensure we have a Player column for identification
        if 'Player' not in df.columns:
            if 'player' in df.columns:
                df['Player'] = df['player']
            elif 'name' in df.columns:
                df['Player'] = df['name']
            else:
                # Create a default player name if none exists
                df['Player'] = [f"Player_{i}" for i in range(len(df))]
        
        # Select only the required columns plus Player and actual value if available
        columns_to_keep = ['Player'] + required_columns
        
        # Add actual value column if it exists
        if 'player_market_value_euro' in df.columns:
            columns_to_keep.append('player_market_value_euro')
        elif 'market_value_euro' in df.columns:
            df['player_market_value_euro'] = df['market_value_euro']
            columns_to_keep.append('player_market_value_euro')
        
        # Keep only the necessary columns
        df = df[columns_to_keep]
        
        # Handle missing values
        df = df.fillna(0)
        
        # Convert percentage strings to floats if needed
        for col in df.columns:
            if 'Per90_' in col and '%' in col:
                try:
                    df[col] = df[col].astype(str).str.rstrip('%').astype(float) / 100
                except:
                    pass
            elif '%' in col:
                try:
                    df[col] = df[col].astype(str).str.rstrip('%').astype(float) / 100
                except:
                    pass
        
        # Convert all numeric columns to float
        for col in df.columns:
            if col != 'Player':
                try:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                except:
                    print(f"Warning: Could not convert column {col} to numeric")
        
        print(f"Preprocessed data shape: {df.shape}")
        return df
        
    except Exception as e:
        print(f"Error in preprocessing: {str(e)}")
        raise

# Main execution
try:
    # First check if the file exists
    if not os.path.exists('${filePath}'):
        print(json.dumps({"error": "CSV file not found"}))
        sys.exit(1)
    
    # Read the raw data to get column names for diagnostics
    try:
        raw_df = pd.read_csv('${filePath}', low_memory=False)
        print(f"CSV loaded successfully with {len(raw_df)} rows and {len(raw_df.columns)} columns")
        print(f"Columns in raw data: {list(raw_df.columns)}")
    except Exception as e:
        print(json.dumps({"error": f"Error reading CSV file: {str(e)}"}))
        sys.exit(1)
    
    # Step 1: Preprocess the data
    try:
        print("Starting preprocessing...")
        preprocessed_data = preprocess_football_data('${filePath}')
        print(f"Preprocessing complete. Result has {len(preprocessed_data)} rows and {len(preprocessed_data.columns)} columns")
        
        # Save preprocessed data for debugging if needed
        preprocessed_path = os.path.join('${tempDir}', 'preprocessed_data.csv')
        preprocessed_data.to_csv(preprocessed_path, index=False)
        
        # Get player names
        player_names = preprocessed_data['Player'].values
        
        # Check if actual values exist
        has_actual_values = 'player_market_value_euro' in preprocessed_data.columns
        actual_values = None
        if has_actual_values:
            actual_values = preprocessed_data['player_market_value_euro'].values
        
    except Exception as e:
        print(json.dumps({"error": f"Error preprocessing data: {str(e)}"}))
        sys.exit(1)
    
    # Step 2: Load the model and make predictions
    try:
        print("Loading model and making predictions...")
        model_path = '${path.join(process.cwd(), "model/pl_model.pkl")}'
        
        if not os.path.exists(model_path):
            print(json.dumps({"error": f"Model file not found at {model_path}. Please ensure the model is available."}))
            sys.exit(1)
        
        # Load the model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Prepare data for prediction
        X = preprocessed_data.drop(['Player'], axis=1, errors='ignore')
        if has_actual_values:
            X = X.drop(['player_market_value_euro'], axis=1, errors='ignore')
        
        # Make predictions
        predictions = model.predict(X)
        
        # Prepare results
        results = []
        for i, player in enumerate(player_names):
            result = {
                'player': str(player),
                'predicted_value': float(predictions[i])
            }
            
            if has_actual_values:
                result['actual_value'] = float(actual_values[i])
                result['difference'] = float(actual_values[i] - predictions[i])
                result['difference_percentage'] = float((result['difference'] / actual_values[i]) * 100) if actual_values[i] != 0 else 0
            
            results.append(result)
        
        # Add preprocessing stats for debugging
        preprocessing_stats = {
            "raw_rows": len(raw_df),
            "raw_columns": len(raw_df.columns),
            "preprocessed_rows": len(preprocessed_data),
            "preprocessed_columns": len(preprocessed_data.columns),
            "preprocessed_column_names": list(preprocessed_data.columns)
        }
        
        # Output results as JSON
        print(json.dumps({
            "success": True,
            "predictions": results,
            "preprocessing_stats": preprocessing_stats
        }))
        
    except Exception as e:
        print(json.dumps({"error": f"Error making predictions: {str(e)}"}))
        sys.exit(1)
    
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`,
    )

    // Execute the Python script
    const { stdout, stderr } = await execAsync(`python ${scriptPath}`)

    // Check for errors in stdout (our script outputs JSON)
    try {
      const result = JSON.parse(stdout)

      if (result.error) {
        console.error("Python script error:", result.error)
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Clean up temporary files
      fs.rmSync(tempDir, { recursive: true, force: true })

      return NextResponse.json(result)
    } catch (error) {
      console.error("Error parsing Python output:", stdout)
      console.error("Python stderr:", stderr)
      return NextResponse.json(
        {
          error: "Error processing the file. Please check the format of your CSV file.",
          details: stdout,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

