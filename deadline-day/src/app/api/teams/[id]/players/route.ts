import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamId = Number.parseInt(params.id)

    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 })
    }

    // Get the year from query params
    const searchParams = request.nextUrl.searchParams
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    // Fetch players for the team with their market values for the specified year
    // Only include players that have a valuation for the selected year
    const players = await db`
      WITH valuations_for_year AS (
        SELECT player_id, market_value_euro
        FROM player_valuations
        WHERE season_start_year = ${year}
      )
      SELECT 
        p.id, 
        p.name, 
        p.position, 
        p.age, 
        p.nationality, 
        p.image_url,
        vfy.market_value_euro
      FROM players p
      INNER JOIN valuations_for_year vfy ON p.id = vfy.player_id
      WHERE p.current_team_id = ${teamId}
        AND vfy.market_value_euro IS NOT NULL
        AND vfy.market_value_euro > 0
      ORDER BY vfy.market_value_euro DESC
    `

    return NextResponse.json({ players })
  } catch (error) {
    console.error("Error fetching team players:", error)
    return NextResponse.json({ error: "Failed to fetch team players" }, { status: 500 })
  }
}

