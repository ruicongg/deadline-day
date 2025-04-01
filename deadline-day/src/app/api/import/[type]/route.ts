import { type NextRequest, NextResponse } from "next/server"
import {
  parseCSV,
  importLeagues,
  importTeams,
  importPlayers,
  importPlayerValuations,
  importPlayerStats,
} from "@/lib/data-import"

export async function POST(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    const fileContents = await file.text()
    const parsedData = (await parseCSV(fileContents)) as any[]

    let result

    switch (params.type) {
      case "leagues":
        result = await importLeagues(parsedData)
        break
      case "teams":
        result = await importTeams(parsedData)
        break
      case "players":
        result = await importPlayers(parsedData)
        break
      case "valuations":
        result = await importPlayerValuations(parsedData)
        break
      case "stats":
        result = await importPlayerStats(parsedData)
        break
      default:
        return NextResponse.json({ message: "Invalid import type" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully imported ${params.type}`,
      count: result.length,
    })
  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json({ message: error.message || "Import failed" }, { status: 500 })
  }
}

