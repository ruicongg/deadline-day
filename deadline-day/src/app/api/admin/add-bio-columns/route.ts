import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if bio columns exist
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'players' AND column_name = 'bio_data'
    `)

    const hasBioColumn = columnCheck.rows.length > 0

    if (!hasBioColumn) {
      // Add bio columns if they don't exist
      await db.query(`
        ALTER TABLE players 
        ADD COLUMN bio_data JSONB,
        ADD COLUMN image_url TEXT,
        ADD COLUMN transfermarkt_url TEXT,
        ADD COLUMN last_bio_update TIMESTAMP
      `)
      return NextResponse.json({
        message: "Added player bio columns to players table",
        success: true,
      })
    }

    return NextResponse.json({
      message: "Bio columns already exist",
      success: true,
      hasBioColumn,
    })
  } catch (error) {
    console.error("Error checking/adding bio columns:", error)
    return NextResponse.json(
      {
        error: "Failed to check/add bio columns",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

