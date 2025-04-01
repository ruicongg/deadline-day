import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to test the connection using tagged template literals
    const result = await sql`SELECT current_timestamp as time, current_database() as database`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: result,
    })
  } catch (error: any) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to connect to database",
        error: process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 },
    )
  }
}

