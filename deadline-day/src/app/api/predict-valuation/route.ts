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

# Import the preprocessing function
${fs.readFileSync(path.join(process.cwd(), "src/lib/preprocess_football_data.py"), "utf8")}

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
        model_path = '${path.join(process.cwd(), "src/lib/valuation_model.pkl")}'
        
        if not os.path.exists(model_path):
            print(json.dumps({"error": "Model file not found. Please ensure the model is available at src/lib/valuation_model.pkl"}))
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

