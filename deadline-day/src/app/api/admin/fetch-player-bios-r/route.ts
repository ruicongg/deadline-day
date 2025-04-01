import { NextResponse } from "next/server"
import { runRBioFetcher } from "../../../../scripts/run-r-bio-fetcher"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 5
    const offset = Number(searchParams.get("offset")) || 0

    // Run the R script to fetch player bios
    const results = await runRBioFetcher(limit, offset)

    // Count successful updates
    const updated = Array.isArray(results) ? results.filter((r) => r.success).length : 0

    return NextResponse.json({
      message: `Processed ${Array.isArray(results) ? results.length : 0} players`,
      results,
      updated,
    })
  } catch (error) {
    console.error("Error fetching player bios with R:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch player bios",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

