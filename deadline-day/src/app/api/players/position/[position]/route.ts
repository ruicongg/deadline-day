import { NextResponse } from "next/server"
import { getPlayersByPosition } from "@/lib/data-access"

export async function GET(request: Request, { params }: { params: { position: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const players = await getPlayersByPosition(params.position, limit)

    return NextResponse.json(players)
  } catch (error) {
    console.error("Error fetching players by position:", error)
    return NextResponse.json({ error: "Failed to fetch players by position", details: error.message }, { status: 500 })
  }
}

