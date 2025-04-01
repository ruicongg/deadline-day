import { NextResponse } from "next/server"
import { getTopPlayers } from "@/lib/data-access"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    const topPlayers = await getTopPlayers(limit)

    return NextResponse.json(topPlayers)
  } catch (error) {
    console.error("Error fetching top players:", error)
    return NextResponse.json({ error: "Failed to fetch top players", details: error.message }, { status: 500 })
  }
}

