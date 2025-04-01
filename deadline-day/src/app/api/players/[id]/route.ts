import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    }

    // Fetch player basic info
    const playerResult = await db`
      SELECT 
        p.id, 
        p.name, 
        p.position, 
        p.age, 
        p.nationality, 
        p.image_url,
        p.current_team_id,
        t.name as team_name,
        l.name as league_name
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      WHERE p.id = ${id}
    `

    if (playerResult.length === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    const player = playerResult[0]

    // Fetch player valuations
    const valuations = await db`
      SELECT 
        pv.season_start_year,
        pv.market_value_euro,
        l.name as league_name
      FROM player_valuations pv
      LEFT JOIN players p ON pv.player_id = p.id
      LEFT JOIN teams t ON p.current_team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      WHERE pv.player_id = ${id}
      ORDER BY pv.season_start_year
    `

    // Fetch player statistics - all seasons
    const playerStats = await db`
      SELECT 
        ps.*,
        l.name as league_name,
        t.name as team_name
      FROM player_stats ps
      LEFT JOIN leagues l ON ps.league_id = l.id
      LEFT JOIN teams t ON ps.team_id = t.id
      WHERE ps.player_id = ${id}
      ORDER BY ps.season_start_year DESC
    `

    // Return the complete player data
    return NextResponse.json({
      id: player.id,
      name: player.name,
      position: player.position,
      age: player.age,
      nationality: player.nationality,
      image_url: player.image_url,
      team: player.team_name,
      league: player.league_name,
      market_value_euro: valuations.length > 0 ? valuations[valuations.length - 1].market_value_euro : null,
      valuationHistory: valuations.map((v) => ({
        season: v.season_start_year.toString(),
        value: v.market_value_euro,
        league: v.league_name || "Unknown",
      })),
      playerStats: playerStats,
    })
  } catch (error) {
    console.error("Error fetching player data:", error)
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 })
  }
}

