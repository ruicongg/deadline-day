import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

// Function to fetch and parse player bio from Transfermarkt
async function fetchPlayerBio(url: string) {
  try {
    // Use a proxy or rotate user agents to avoid being blocked
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch player bio: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract player info
    const playerName = $(".data-header__headline-wrapper h1").text().trim()
    const imageUrl = $(".data-header__profile-image img").attr("src") || null

    // Extract data from info table
    const bioData: Record<string, any> = {
      name: playerName,
    }

    // Extract data from the info boxes
    $(".info-table__content--regular").each((i, el) => {
      const label = $(el)
        .prev(".info-table__content--label")
        .text()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(":", "")
      const value = $(el).text().trim()
      if (label && value) {
        bioData[label] = value
      }
    })

    // Extract current club
    const currentClub = $(".data-header__club a").text().trim()
    if (currentClub) {
      bioData.current_club = currentClub
    }

    // Extract contract info
    const contractInfo = $(".data-header__contract").text().trim()
    if (contractInfo) {
      bioData.contract_info = contractInfo
    }

    // Extract market value
    const marketValue = $(".data-header__market-value-wrapper .data-header__market-value-inner").text().trim()
    if (marketValue) {
      bioData.market_value = marketValue
    }

    return {
      bioData,
      imageUrl,
    }
  } catch (error) {
    console.error(`Error fetching player bio from ${url}:`, error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 5
    const offset = Number(searchParams.get("offset")) || 0

    // Get players with Transfermarkt URLs that haven't been updated recently
    const players = await db.query(
      `
      SELECT id, name, transfermarkt_url 
      FROM players 
      WHERE transfermarkt_url IS NOT NULL 
      AND (last_bio_update IS NULL OR last_bio_update < NOW() - INTERVAL '7 days')
      ORDER BY last_bio_update ASC NULLS FIRST
      LIMIT $1 OFFSET $2
    `,
      [limit, offset],
    )

    if (players.rows.length === 0) {
      return NextResponse.json({
        message: "No players found with Transfermarkt URLs to update",
        updated: 0,
      })
    }

    const results = []

    // Process each player
    for (const player of players.rows) {
      try {
        if (!player.transfermarkt_url) continue

        const { bioData, imageUrl } = await fetchPlayerBio(player.transfermarkt_url)

        // Update player in database
        await db.query(
          `
          UPDATE players 
          SET 
            bio_data = $1,
            image_url = COALESCE($2, image_url),
            last_bio_update = NOW()
          WHERE id = $3
        `,
          [JSON.stringify(bioData), imageUrl, player.id],
        )

        results.push({
          id: player.id,
          name: player.name,
          success: true,
        })
      } catch (error) {
        console.error(`Error processing player ${player.name}:`, error)
        results.push({
          id: player.id,
          name: player.name,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} players`,
      results,
      updated: results.filter((r) => r.success).length,
    })
  } catch (error) {
    console.error("Error fetching player bios:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch player bios",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

