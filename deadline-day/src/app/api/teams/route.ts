import { NextResponse } from "next/server"
import { TeamService } from "@/lib/services/team-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""
    const leagueId = searchParams.get("leagueId") ? Number(searchParams.get("leagueId")) : null
    const country = searchParams.get("country") || ""

    const result = await TeamService.getTeams({
      page,
      limit,
      search,
      leagueId,
      country,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const team = await TeamService.createTeam(data)

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Failed to create team", details: error.message }, { status: 500 })
  }
}

