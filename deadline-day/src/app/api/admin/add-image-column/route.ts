import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if image_url column exists
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'players' AND column_name = 'image_url'
    `)

    const hasImageColumn = columnCheck.rows.length > 0

    if (!hasImageColumn) {
      // Add image_url column if it doesn't exist
      await db.query(`
        ALTER TABLE players 
        ADD COLUMN image_url TEXT
      `)
      return NextResponse.json({
        message: "Added image_url column to players table",
        success: true,
      })
    }

    return NextResponse.json({
      message: "image_url column already exists",
      success: true,
      hasImageColumn,
    })
  } catch (error) {
    console.error("Error checking/adding image column:", error)
    return NextResponse.json(
      {
        error: "Failed to check/add image column",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

