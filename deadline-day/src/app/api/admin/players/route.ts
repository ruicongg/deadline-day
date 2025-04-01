import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const offset = (page - 1) * limit

    // Get players with pagination
    const [playersResult, countResult] = await Promise.all([
      db.query(
        `
        SELECT id, name, transfermarkt_url
        FROM players
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
      `,
        [limit, offset],
      ),
      db.query(`
        SELECT COUNT(*) FROM players
      `),
    ])

    const total = Number.parseInt(countResult.rows[0]?.count || "0")

    return NextResponse.json({
      players: playersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch players",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

