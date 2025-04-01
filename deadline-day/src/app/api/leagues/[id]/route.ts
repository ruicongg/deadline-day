import { NextResponse } from "next/server"
import { LeagueService } from "@/lib/services/league-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid league ID" }, { status: 400 })
    }

    const league = await LeagueService.getLeagueById(id)

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    return NextResponse.json(league)
  } catch (error) {
    console.error("Error fetching league:", error)
    return NextResponse.json({ error: "Failed to fetch league", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid league ID" }, { status: 400 })
    }

    const data = await request.json()

    const league = await LeagueService.updateLeague({ id, ...data })

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    return NextResponse.json(league)
  } catch (error) {
    console.error("Error updating league:", error)
    return NextResponse.json({ error: "Failed to update league", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid league ID" }, { status: 400 })
    }

    const league = await LeagueService.deleteLeague(id)

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "League deleted successfully" })
  } catch (error) {
    console.error("Error deleting league:", error)
    return NextResponse.json({ error: "Failed to delete league", details: error.message }, { status: 500 })
  }
}

