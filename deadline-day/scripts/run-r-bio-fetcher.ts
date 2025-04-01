import { spawn } from "child_process"
import * as fs from "fs"
import * as path from "path"

// Function to run the R script
export async function runRBioFetcher(limit = 10, offset = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    // Path to the R script
    const scriptPath = path.join(process.cwd(), "scripts", "fetch_player_bios.R")

    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`R script not found at ${scriptPath}`))
    }

    // Spawn R process
    const rProcess = spawn("Rscript", [scriptPath, limit.toString(), offset.toString()])

    let stdout = ""
    let stderr = ""

    // Collect stdout
    rProcess.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    // Collect stderr
    rProcess.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    // Handle process completion
    rProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("R script error:", stderr)
        return reject(new Error(`R script exited with code ${code}: ${stderr}`))
      }

      try {
        // Parse JSON output from R script
        const jsonStart = stdout.indexOf("[")
        if (jsonStart >= 0) {
          const jsonOutput = stdout.substring(jsonStart)
          const results = JSON.parse(jsonOutput)
          resolve(results)
        } else {
          resolve({ message: stdout.trim() })
        }
      } catch (error) {
        console.error("Error parsing R script output:", error)
        reject(error)
      }
    })
  })
}

// If this script is run directly
if (require.main === module) {
  const limit = process.argv[2] ? Number.parseInt(process.argv[2]) : 10
  const offset = process.argv[3] ? Number.parseInt(process.argv[3]) : 0

  runRBioFetcher(limit, offset)
    .then((results) => {
      console.log(JSON.stringify(results, null, 2))
    })
    .catch((error) => {
      console.error("Error running R bio fetcher:", error)
      process.exit(1)
    })
}

