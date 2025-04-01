import { type NextRequest, NextResponse } from "next/server"
import { getTopPlayers } from "@/lib/data-access"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const metric = searchParams.get("metric") || "goals_per90"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const leagueId = searchParams.get("leagueId") ? Number.parseInt(searchParams.get("leagueId")!) : undefined
    const seasonYear = searchParams.get("season") ? Number.parseInt(searchParams.get("season")!) : 2023
    const position = searchParams.get("position") || undefined

    const players = await getTopPlayers({
      metric,
      limit,
      leagueId,
      seasonYear,
      position,
    })

    return NextResponse.json({ players })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch top players" }, { status: 500 })
  }
}

