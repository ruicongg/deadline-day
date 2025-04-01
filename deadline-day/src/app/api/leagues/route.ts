import { NextResponse } from "next/server"
import { LeagueService } from "@/lib/services/league-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""
    const country = searchParams.get("country") || ""

    const result = await LeagueService.getLeagues({
      page,
      limit,
      search,
      country,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return NextResponse.json({ error: "Failed to fetch leagues", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const league = await LeagueService.createLeague(data)

    return NextResponse.json(league, { status: 201 })
  } catch (error) {
    console.error("Error creating league:", error)
    return NextResponse.json({ error: "Failed to create league", details: error.message }, { status: 500 })
  }
}

