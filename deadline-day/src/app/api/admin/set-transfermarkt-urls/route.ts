import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { urls } = await request.json()

    if (!urls || Object.keys(urls).length === 0) {
      return NextResponse.json(
        {
          error: "No URLs provided",
        },
        { status: 400 },
      )
    }

    let updated = 0

    // Update each player's Transfermarkt URL
    for (const [playerId, url] of Object.entries(urls)) {
      if (!url) continue

      await db.query(
        `
        UPDATE players 
        SET transfermarkt_url = $1
        WHERE id = $2
      `,
        [url, playerId],
      )

      updated++
    }

    return NextResponse.json({
      message: `Updated ${updated} player URLs`,
      updated,
    })
  } catch (error) {
    console.error("Error setting Transfermarkt URLs:", error)
    return NextResponse.json(
      {
        error: "Failed to set Transfermarkt URLs",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

