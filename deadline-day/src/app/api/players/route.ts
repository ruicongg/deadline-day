import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const position = searchParams.get("position")
  const leagueId = searchParams.get("leagueId")
  const teamId = searchParams.get("teamId")
  const search = searchParams.get("search")

  const offset = (page - 1) * limit

  try {
    // Build the query conditions
    const conditions = []
    const params: any[] = []
    let paramIndex = 1

    if (position) {
      conditions.push(`p.position ILIKE $${paramIndex}`)
      params.push(`%${position}%`)
      paramIndex++
    }

    if (leagueId) {
      conditions.push(`t.league_id = $${paramIndex}`)
      params.push(leagueId)
      paramIndex++
    }

    if (teamId) {
      conditions.push(`p.current_team_id = $${paramIndex}`)
      params.push(teamId)
      paramIndex++
    }

    if (search) {
      conditions.push(`p.name ILIKE $${paramIndex}`)
      params.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get the latest market value for each player
    const query = `
      WITH latest_valuations AS (
        SELECT DISTINCT ON (player_id) 
          player_id, 
          market_value_euro,
          season_start_year
        FROM player_valuations
        ORDER BY player_id, season_start_year DESC
      )
      SELECT 
        p.id, 
        p.name, 
        p.position, 
        p.age, 
        p.nationality, 
        p.image_url,
        t.name as team_name, 
        l.name as league_name, 
        lv.market_value_euro
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      LEFT JOIN latest_valuations lv ON p.id = lv.player_id
      ${whereClause}
      ORDER BY lv.market_value_euro DESC NULLS LAST, p.name
      LIMIT ${limit} OFFSET ${offset}
    `

    // Count total players matching the criteria
    const countQuery = `
      SELECT COUNT(*) as total
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      ${whereClause}
    `

    // Execute queries
    const players = await db.query(query, params)
    const countResult = await db.query(countQuery, params)

    const total = Number.parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      players: players.rows,
      page,
      limit,
      total,
      totalPages,
    })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

