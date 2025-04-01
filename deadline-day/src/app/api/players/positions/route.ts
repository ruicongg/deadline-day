import { NextResponse } from "next/server"
import { PlayerService } from "@/lib/services/player-service"

export async function GET() {
  try {
    const positions = await PlayerService.getPositions()
    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions", details: error.message }, { status: 500 })
  }
}

