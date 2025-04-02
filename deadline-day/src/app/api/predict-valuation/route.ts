import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"
import { parse } from "csv-parse/sync"

// FastAPI endpoint URL
const FASTAPI_ENDPOINT = "http://127.0.0.1:8000/predict"

// Function to convert from log scale back to original scale
function convertFromLogScale(logValue) {
  return Math.exp(logValue) - 1
}

// Function to calculate basic statistics
function calculateStatistics(values) {
  if (!values || values.length === 0) return null

  // Sort values for median and percentiles
  const sortedValues = [...values].sort((a, b) => a - b)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    median: sortedValues[Math.floor(sortedValues.length / 2)],
    count: values.length,
    // Calculate percentiles
    percentile25: sortedValues[Math.floor(sortedValues.length * 0.25)],
    percentile75: sortedValues[Math.floor(sortedValues.length * 0.75)],
    // Standard deviation
    stdDev: Math.sqrt(
      values.reduce((sum, val) => {
        const avg = values.reduce((s, v) => s + v, 0) / values.length
        return sum + Math.pow(val - avg, 2)
      }, 0) / values.length,
    ),
  }
}

// Function to categorize player value
function categorizePlayerValue(value, stats) {
  if (value >= stats.percentile75) {
    return "High Value"
  } else if (value <= stats.percentile25) {
    return "Low Value"
  } else {
    return "Medium Value"
  }
}

// Function to extract key performance indicators from player data
function extractPlayerKPIs(record) {
  const kpis = {}

  // Extract attacking metrics
  const attackingMetrics = [
    "Per90_Goals",
    "Per90_Assists",
    "Per90_Shots Total",
    "Per90_Shots on Target",
    "Per90_xG: Expected Goals",
  ]

  // Extract passing metrics
  const passingMetrics = [
    "Per90_Pass Completion %",
    "Per90_Progressive Passes",
    "Per90_Key Passes",
    "Per90_Passes into Final Third",
  ]

  // Extract defensive metrics
  const defensiveMetrics = [
    "Per90_Tackles",
    "Per90_Interceptions",
    "Per90_Blocks",
    "Per90_Clearances",
    "Per90_% of Dribblers Tackled",
  ]

  // Calculate average for each category if data exists
  let attackCount = 0
  let attackSum = 0
  attackingMetrics.forEach((metric) => {
    if (record[metric] !== undefined) {
      const value = typeof record[metric] === "string" ? Number.parseFloat(record[metric]) : record[metric]
      if (!isNaN(value)) {
        attackSum += value
        attackCount++
      }
    }
  })

  let passCount = 0
  let passSum = 0
  passingMetrics.forEach((metric) => {
    if (record[metric] !== undefined) {
      const value = typeof record[metric] === "string" ? Number.parseFloat(record[metric]) : record[metric]
      if (!isNaN(value)) {
        passSum += value
        passCount++
      }
    }
  })

  let defenseCount = 0
  let defenseSum = 0
  defensiveMetrics.forEach((metric) => {
    if (record[metric] !== undefined) {
      const value = typeof record[metric] === "string" ? Number.parseFloat(record[metric]) : record[metric]
      if (!isNaN(value)) {
        defenseSum += value
        defenseCount++
      }
    }
  })

  // Add averages to KPIs if we have data
  if (attackCount > 0) kpis.attackingScore = attackSum / attackCount
  if (passCount > 0) kpis.passingScore = passSum / passCount
  if (defenseCount > 0) kpis.defensiveScore = defenseSum / defenseCount

  // Add age if available
  if (record.age) {
    kpis.age = typeof record.age === "string" ? Number.parseInt(record.age) : record.age
  }

  // Add position if available
  if (record.position) {
    kpis.position = record.position
  }

  return kpis
}

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

    // Read and parse the CSV file
    const csvContent = fs.readFileSync(filePath, "utf8")
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    })

    console.log(`CSV loaded successfully with ${records.length} rows`)

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty or invalid" }, { status: 400 })
    }

    // Extract player names for the results
    const playerNames = records.map((record) => record.Player || record.player || record.name || "Unknown Player")

    // Extract actual values if they exist (these are in log scale)
    let actualValues = null
    const hasActualValues = records.some(
      (record) => record.player_market_value_euro !== undefined || record.market_value_euro !== undefined,
    )

    if (hasActualValues) {
      actualValues = records.map((record) => {
        const logValue = record.player_market_value_euro || record.market_value_euro || 0
        const numericLogValue = typeof logValue === "number" ? logValue : Number.parseFloat(logValue) || 0
        // Convert from log scale to original scale
        return convertFromLogScale(numericLogValue)
      })
    }

    // Get predictions from FastAPI
    const predictions = []
    const playerKPIs = []

    for (const record of records) {
      try {
        // Extract KPIs for this player
        playerKPIs.push(extractPlayerKPIs(record))

        // Convert all values to numbers to ensure proper JSON formatting
        const cleanRecord = {}

        for (const key in record) {
          if (
            key !== "Player" &&
            key !== "player" &&
            key !== "name" &&
            key !== "player_market_value_euro" &&
            key !== "market_value_euro"
          ) {
            let value = record[key]
            // Convert string values to numbers
            if (typeof value === "string") {
              // Handle percentage values
              if (value.includes("%")) {
                value = Number.parseFloat(value.replace("%", "")) / 100
              } else {
                value = Number.parseFloat(value) || 0
              }
            }

            // Handle NaN, Infinity
            if (!isFinite(value)) {
              value = 0
            }

            cleanRecord[key] = value
          }
        }

        const response = await fetch(FASTAPI_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanRecord),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`FastAPI error response: ${errorText}`)
          throw new Error(`FastAPI returned status ${response.status}: ${errorText}`)
        }

        const result = await response.json()

        // Convert prediction from log scale back to original scale
        const logPrediction = result.prediction
        const originalScalePrediction = convertFromLogScale(logPrediction)

        predictions.push(originalScalePrediction)
      } catch (err) {
        console.error("Error getting prediction for record:", err)
        predictions.push(0)
        playerKPIs.push({}) // Add empty KPIs for this player
      }
    }

    // Calculate statistics for predictions
    const predictionStats = calculateStatistics(predictions)

    // Calculate statistics for actual values if available
    const actualValueStats = hasActualValues ? calculateStatistics(actualValues) : null

    // Combine player names, predictions, and actual values with insights
    const results = playerNames.map((player, index) => {
      const result: any = {
        player,
        predicted_value: predictions[index],
        value_category: predictionStats ? categorizePlayerValue(predictions[index], predictionStats) : null,
        performance_metrics: playerKPIs[index] || {},
      }

      // Add comparison to average
      if (predictionStats) {
        result.comparison_to_average = {
          value: predictions[index] - predictionStats.average,
          percentage: (predictions[index] / predictionStats.average - 1) * 100,
        }
      }

      if (actualValues) {
        result.actual_value = actualValues[index]
        result.difference = actualValues[index] - predictions[index]
        result.difference_percentage = actualValues[index] !== 0 ? (result.difference / actualValues[index]) * 100 : 0
      }

      return result
    })

    // Clean up temporary files
    fs.rmSync(tempDir, { recursive: true, force: true })

    return NextResponse.json({
      success: true,
      predictions: results,
      statistics: {
        predicted_values: predictionStats,
        actual_values: actualValueStats,
      },
      preprocessing_stats: {
        raw_rows: records.length,
        processed_rows: records.length,
        columns: Object.keys(records[0] || {}).length,
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

